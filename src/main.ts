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
  Project,
} from "./types";

let mainWindow: BrowserWindow | null = null;
const runningProcesses: Map<string, ChildProcess> = new Map();
const commandResults: Map<string, CommandResult> = new Map();
const configPath = path.join(app.getPath("userData"), "deployment-config.json");

const defaultConfig: DeploymentConfig = {
  projects: [],
  selectedProject: null,
  selectedEnvironments: [],
  selectedFlows: [],
};

let currentConfig: DeploymentConfig = { ...defaultConfig };

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    log.info("Main window closed");
    stopAllProcesses();
    mainWindow = null;
  });
}

function loadConfig(): DeploymentConfig {
  const rootConfigPath = path.join(__dirname, "../deployment-config.json");
  const userConfigPath = path.join(
    app.getPath("userData"),
    "deployment-config.json"
  );

  try {
    if (fs.existsSync(rootConfigPath)) {
      const configData = fs.readFileSync(rootConfigPath, "utf8");
      const loadedConfig = JSON.parse(configData) as DeploymentConfig;
      log.info("Loaded config from project root:", rootConfigPath);
      currentConfig = { ...defaultConfig, ...loadedConfig };
      return currentConfig;
    }
    if (fs.existsSync(userConfigPath)) {
      const configData = fs.readFileSync(userConfigPath, "utf8");
      const loadedConfig = JSON.parse(configData) as DeploymentConfig;
      log.info("Loaded config from user data:", userConfigPath);
      currentConfig = { ...defaultConfig, ...loadedConfig };
      return currentConfig;
    }
    log.info("No config found, using default config");
    currentConfig = { ...defaultConfig };
  } catch (error: any) {
    sendErrorToRenderer(`Error loading configuration: ${error.message}`);
    log.error("Error loading configuration:", error);
  }
  return { ...currentConfig };
}

function saveConfig(config: DeploymentConfig): void {
  try {
    // Log config being saved for debugging
    log.info("Saving configuration:", JSON.stringify(config, null, 2));

    const userConfigPath = path.join(
      app.getPath("userData"),
      "deployment-config.json"
    );

    // Create a string representation with pretty formatting
    const configJson = JSON.stringify(config, null, 2);

    // Write to file
    fs.writeFileSync(userConfigPath, configJson, "utf8");

    // Update current config reference
    currentConfig = { ...config };

    log.info("Configuration saved successfully to:", userConfigPath);

    // Notify renderer process about the config update
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send("configUpdated", currentConfig);
    }
  } catch (error: any) {
    sendErrorToRenderer(`Error saving configuration: ${error.message}`);
    log.error("Error saving configuration:", error);
    throw error; // Rethrow to allow proper error handling
  }
}

function generateCommandId(flow: Flow, environment: Environment): string {
  return `${flow}-${environment}-${Date.now()}`;
}

function runFlow(flow: Flow, environment: Environment): string {
  const selectedProject = currentConfig.projects.find(
    (p) => p.name === currentConfig.selectedProject
  );
  if (!selectedProject) {
    const errorMessage = "No project selected";
    sendErrorToRenderer(errorMessage);
    log.error(errorMessage);
    return "";
  }

  const flowConfig = selectedProject.flows[flow];
  if (!flowConfig) {
    const errorMessage = `Unknown flow: ${flow}`;
    sendErrorToRenderer(errorMessage);
    log.error(errorMessage);
    return "";
  }

  const commandSteps = flowConfig.commands[environment];
  if (!commandSteps || Object.keys(commandSteps).length === 0) {
    const errorMessage = `No command steps defined for ${environment} in flow ${flow}`;
    sendErrorToRenderer(errorMessage);
    log.error(errorMessage);
    return "";
  }

  // Use the project's root directory for execution
  const execDirectory = selectedProject.path;
  const execId = generateCommandId(flow, environment);

  // Create a script with all the steps
  const scriptLines = Object.entries(commandSteps)
    .sort(([stepA], [stepB]) => {
      // Sort by step number
      return parseInt(stepA) - parseInt(stepB);
    })
    .map(([step, cmd]) => cmd);

  const fullScript = scriptLines.join("\n");

  const commandResult: CommandResult = {
    id: execId,
    directory: execDirectory,
    flow,
    environment,
    status: "running",
    logs: `Starting flow: ${flowConfig.name} with steps for ${environment} environment\n`,
    startTime: Date.now(),
  };

  commandResults.set(execId, commandResult);
  mainWindow?.webContents.send("commandStatus", commandResult);

  try {
    if (!fs.existsSync(execDirectory)) {
      const errorMessage = `Project directory not found: ${execDirectory}`;
      sendErrorToRenderer(errorMessage);
      throw new Error(errorMessage);
    }

    // Create a temporary script file to execute the steps
    const tempScriptPath = path.join(app.getPath("temp"), `flow-${execId}.sh`);
    fs.writeFileSync(tempScriptPath, fullScript, { mode: 0o755 });

    appendCommandOutput(execId, `Executing script:\n${fullScript}\n\n`);

    const childProcess = spawn(tempScriptPath, [], {
      cwd: execDirectory,
      shell: true,
      env: { ...process.env, DEPLOY_ENV: environment },
    });

    runningProcesses.set(execId, childProcess);

    childProcess.stdout.on("data", (data) => {
      appendCommandOutput(execId, data.toString());
    });

    childProcess.stderr.on("data", (data) => {
      appendCommandOutput(execId, data.toString());
    });

    childProcess.on("close", (code) => {
      const status = code === 0 ? "success" : "error";
      updateCommandStatus(execId, status);
      runningProcesses.delete(execId);

      // Clean up the temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (err) {
        log.error(`Failed to delete temporary script: ${err}`);
      }

      const result = commandResults.get(execId);
      if (result) {
        result.endTime = Date.now();
        commandResults.set(execId, result);
      }
    });

    log.info(`Flow started: ${flow} for ${environment}`);
    return execId;
  } catch (error: any) {
    log.error(`Error running flow: ${error}`);
    updateCommandStatus(execId, "error");
    appendCommandOutput(execId, `Error starting flow: ${error}`);
    sendErrorToRenderer(`Error starting flow: ${error.message}`);
    return execId;
  }
}

function appendCommandOutput(commandId: string, output: string): void {
  const result = commandResults.get(commandId);
  if (result) {
    result.logs += output;
    commandResults.set(commandId, result);
    mainWindow?.webContents.send("commandOutput", { id: commandId, output });
  }
}

function updateCommandStatus(
  commandId: string,
  status: "running" | "success" | "error" | "stopped"
): void {
  const result = commandResults.get(commandId);
  if (result) {
    result.status = status;
    commandResults.set(commandId, result);
    mainWindow?.webContents.send("commandStatus", result);
  }
}

function stopCommand(commandId: string): void {
  const process = runningProcesses.get(commandId);
  if (process) {
    process.kill();
    runningProcesses.delete(commandId);
    updateCommandStatus(commandId, "stopped");
  }
}

function stopAllProcesses(): void {
  for (const [commandId, process] of runningProcesses.entries()) {
    process.kill();
    updateCommandStatus(commandId, "stopped");
  }
  runningProcesses.clear();
}

async function selectDirectory(): Promise<string | null> {
  if (!mainWindow) {
    log.warn("Cannot select directory: Main window is null");
    return null;
  }

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Project Root Directory",
    });

    if (result.canceled || !result.filePaths.length) {
      log.info("Directory selection canceled");
      return null;
    }

    const selectedPath = result.filePaths[0];
    log.info("Directory selected:", selectedPath);
    return selectedPath;
  } catch (error: any) {
    log.error("Error during directory selection:", error);
    sendErrorToRenderer(`Error selecting directory: ${error.message}`);
    return null;
  }
}

function sendErrorToRenderer(message: string) {
  log.error(message);
  console.log("Sending error to renderer:", message);
  mainWindow?.webContents.send("error", message);
}

function registerIpcHandlers(): void {
  ipcMain.handle("runFlow", async (_, args) => {
    try {
      const { flow, environment } = args;
      return runFlow(flow, environment);
    } catch (error: any) {
      sendErrorToRenderer(`Error running flow: ${error.message}`);
      return null;
    }
  });

  ipcMain.handle("stopCommand", async (_, commandId) => {
    try {
      stopCommand(commandId);
      return true;
    } catch (error: any) {
      sendErrorToRenderer(`Error stopping command: ${error.message}`);
      return false;
    }
  });

  ipcMain.handle("stopAllCommands", async () => {
    try {
      stopAllProcesses();
      return true;
    } catch (error: any) {
      sendErrorToRenderer(`Error stopping all commands: ${error.message}`);
      return false;
    }
  });

  ipcMain.handle("selectDirectory", async () => {
    try {
      return await selectDirectory();
    } catch (error: any) {
      sendErrorToRenderer(`Error selecting directory: ${error.message}`);
      return null;
    }
  });

  ipcMain.handle("saveConfig", async (_, config: DeploymentConfig) => {
    try {
      saveConfig(config);
      return true;
    } catch (error: any) {
      sendErrorToRenderer(`Error saving configuration: ${error.message}`);
      return false;
    }
  });

  ipcMain.handle("loadConfig", async () => {
    try {
      return currentConfig;
    } catch (error: any) {
      sendErrorToRenderer(`Error loading configuration: ${error.message}`);
      return null;
    }
  });
}

app.whenReady().then(() => {
  log.info("App is ready");
  currentConfig = loadConfig();
  registerIpcHandlers();
  createWindow();

  if (mainWindow) {
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow?.webContents.send("configUpdated", currentConfig);
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  stopAllProcesses();
});
