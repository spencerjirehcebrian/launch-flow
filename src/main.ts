import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as log from "electron-log";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import {
  CommandResult,
  DeploymentConfig,
  Environment,
  Flow,
  FLOWS,
} from "./types";

// Define interfaces for your app's types
interface AppWindow extends BrowserWindow {
  // Add any custom properties you need
}

let mainWindow: AppWindow | null = null;
// Store all running processes
const runningProcesses: Map<string, ChildProcess> = new Map();
// Store command results with logs
const commandResults: Map<string, CommandResult> = new Map();
// Default config path
const configPath = path.join(app.getPath("userData"), "deployment-config.json");

// Default configuration
const defaultConfig: DeploymentConfig = {
  rootDirectory: "",
  selectedEnvironments: ["dev"],
  selectedFlows: [],
};

// Current configuration
let currentConfig: DeploymentConfig = { ...defaultConfig };

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  }) as AppWindow;

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Log when the window is closed
  mainWindow.on("closed", () => {
    log.info("Main window closed");
    // Stop all running processes when the window is closed
    stopAllProcesses();
    mainWindow = null;
  });
}

// Load configuration from file or create default
function loadConfig(): DeploymentConfig {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf8");
      const loadedConfig = JSON.parse(configData) as DeploymentConfig;
      log.info("Configuration loaded successfully");
      return { ...defaultConfig, ...loadedConfig };
    }
  } catch (error) {
    log.error("Error loading configuration:", error);
  }

  // Return default config if loading fails
  return { ...defaultConfig };
}

// Save configuration to file
function saveConfig(config: DeploymentConfig): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    log.info("Configuration saved successfully");
  } catch (error) {
    log.error("Error saving configuration:", error);
  }
}

// Generate a unique ID for command execution
function generateCommandId(flow: Flow, environment: Environment): string {
  return `${flow}-${environment}-${Date.now()}`;
}

// Run a flow with the specified environment
function runFlow(flow: Flow, environment: Environment): string {
  const rootDirectory = currentConfig.rootDirectory;

  if (!rootDirectory) {
    log.error("No directory specified for command execution");
    return "";
  }

  const flowConfig = FLOWS[flow];

  if (!flowConfig) {
    log.error(`Unknown flow: ${flow}`);
    return "";
  }

  // Build the full path to the flow directory
  const flowDirectory = path.join(rootDirectory, flowConfig.path);

  // Build the command with the environment
  const command = `${flowConfig.command}:${environment}`;

  // Generate a unique ID for this command execution
  const execId = generateCommandId(flow, environment);

  // Create command result object
  const commandResult: CommandResult = {
    id: execId,
    directory: flowDirectory,
    flow: flow,
    environment: environment,
    status: "running",
    logs: `Starting flow: ${flowConfig.name} with command "${command}" for ${environment} environment\n`,
    startTime: Date.now(),
  };

  // Store command result
  commandResults.set(execId, commandResult);

  // Send initial status to renderer
  if (mainWindow) {
    mainWindow.webContents.send("commandStatus", commandResult);
  }

  try {
    // Environment variables for the command
    const env = { ...process.env, DEPLOY_ENV: environment };

    // Ensure the directory exists
    if (!fs.existsSync(flowDirectory)) {
      throw new Error(`Directory not found: ${flowDirectory}`);
    }

    // Spawn the process to capture output in real-time
    const childProcess = spawn(command, [], {
      cwd: flowDirectory,
      shell: true,
      env,
    });

    // Store the process
    runningProcesses.set(execId, childProcess);

    // Handle output
    childProcess.stdout.on("data", (data) => {
      const output = data.toString();
      appendCommandOutput(execId, output);
    });

    childProcess.stderr.on("data", (data) => {
      const output = data.toString();
      appendCommandOutput(execId, output);
    });

    // Handle process completion
    childProcess.on("close", (code) => {
      const status = code === 0 ? "success" : "error";
      updateCommandStatus(execId, status);
      runningProcesses.delete(execId);

      const result = commandResults.get(execId);
      if (result) {
        result.endTime = Date.now();
        commandResults.set(execId, result);
      }

      log.info(`Flow completed: ${flow} for ${environment}, status: ${status}`);
    });

    log.info(`Flow started: ${flow} for ${environment}`);
    return execId;
  } catch (error) {
    log.error(`Error running flow: ${error}`);
    updateCommandStatus(execId, "error");
    appendCommandOutput(execId, `Error starting flow: ${error}`);
    return execId;
  }
}

// Append output to command logs
function appendCommandOutput(commandId: string, output: string): void {
  const result = commandResults.get(commandId);
  if (result) {
    result.logs += output;
    commandResults.set(commandId, result);

    // Send the updated output to renderer
    if (mainWindow) {
      mainWindow.webContents.send("commandOutput", {
        id: commandId,
        output,
      });
    }
  }
}

// Update command status
function updateCommandStatus(
  commandId: string,
  status: "running" | "success" | "error" | "stopped"
): void {
  const result = commandResults.get(commandId);
  if (result) {
    result.status = status;
    commandResults.set(commandId, result);

    // Send the updated status to renderer
    if (mainWindow) {
      mainWindow.webContents.send("commandStatus", result);
    }
  }
}

// Stop a running command
function stopCommand(commandId: string): void {
  const process = runningProcesses.get(commandId);
  if (process) {
    process.kill();
    runningProcesses.delete(commandId);
    updateCommandStatus(commandId, "stopped");
    log.info(`Command stopped: ${commandId}`);
  }
}

// Stop all running processes
function stopAllProcesses(): void {
  for (const [commandId, process] of runningProcesses.entries()) {
    process.kill();
    updateCommandStatus(commandId, "stopped");
  }
  runningProcesses.clear();
  log.info("All processes stopped");
}

// Select a directory via dialog
async function selectRootDirectory(): Promise<string | null> {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedDirectory = result.filePaths[0];

  // Update configuration with the new root directory
  currentConfig.rootDirectory = selectedDirectory;
  saveConfig(currentConfig);

  return selectedDirectory;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  log.info("App is ready");

  // Load existing configuration
  currentConfig = loadConfig();

  // Register IPC handlers
  registerIpcHandlers();

  // Create the main window
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Register all IPC handlers
function registerIpcHandlers(): void {
  // Run a flow
  ipcMain.handle("runFlow", async (_, args) => {
    const { flow, environment } = args;
    return runFlow(flow, environment);
  });

  // Stop a command
  ipcMain.handle("stopCommand", async (_, commandId) => {
    stopCommand(commandId);
    return true;
  });

  // Stop all commands
  ipcMain.handle("stopAllCommands", async () => {
    stopAllProcesses();
    return true;
  });

  // Select a root directory
  ipcMain.handle("selectDirectory", async () => {
    return await selectRootDirectory();
  });

  // Save configuration
  ipcMain.handle("saveConfig", async (_, config) => {
    currentConfig = config;
    saveConfig(config);
    return true;
  });

  // Load configuration
  ipcMain.handle("loadConfig", async () => {
    return currentConfig;
  });
}

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log.info("All windows closed, quitting app");
    app.quit();
  }
});

// Handle app will quit
app.on("will-quit", () => {
  stopAllProcesses();
});
