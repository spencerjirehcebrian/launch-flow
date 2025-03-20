// Define the API interface to match what's exposed in preload.ts
interface API {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  invoke: <T>(channel: string, data: any) => Promise<T>;
  removeAllListeners: (channel: string) => void;
}

// Import types for better TypeScript support
import {
  DeploymentConfig,
  CommandResult,
  Environment,
  Flow,
  FLOWS,
} from "../types";

// Properly extend the Window interface in the global scope
declare global {
  interface Window {
    api: API;
  }
}

// State management
let currentConfig: DeploymentConfig;
let activeLogTab: string | null = null;
let runningCommands: Map<string, CommandResult> = new Map();

// DOM Elements
const rootDirectoryInput = document.getElementById(
  "root-directory"
) as HTMLInputElement;
const selectDirectoryBtn = document.getElementById("select-directory-btn")!;
const envCheckboxes = document.querySelectorAll(
  ".env-checkbox"
) as NodeListOf<HTMLInputElement>;
const flowCheckboxes = document.querySelectorAll(
  ".flow-checkbox"
) as NodeListOf<HTMLInputElement>;
const logTabsEl = document.getElementById("log-tabs")!;
const logDisplayEl = document.getElementById("log-display")!;
const runBtn = document.getElementById("run-btn")!;
const stopBtn = document.getElementById("stop-btn")!;
const clearLogsBtn = document.getElementById("clear-logs-btn")!;

// Initialize the application
async function init() {
  // Load configuration
  currentConfig = await window.api.invoke<DeploymentConfig>("loadConfig", null);

  // If this is the first run, set default values
  if (!currentConfig.selectedEnvironments) {
    currentConfig.selectedEnvironments = ["dev"]; // Default to dev
  }

  if (!currentConfig.selectedFlows) {
    currentConfig.selectedFlows = []; // Default to none selected
  }

  // Set up event listeners
  setupEventListeners();

  // Render UI components
  updateRootDirectoryDisplay();
  updateEnvironmentCheckboxes();
  updateFlowCheckboxes();

  // Initialize log display
  initializeLogDisplay();

  // Set up IPC listeners
  setupIpcListeners();

  console.log("Renderer process loaded");
}

// Set up event listeners
function setupEventListeners() {
  // Select directory button
  selectDirectoryBtn.addEventListener("click", selectDirectory);

  // Environment checkboxes
  envCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateSelectedEnvironments();
    });
  });

  // Flow checkboxes
  flowCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateSelectedFlows();
    });
  });

  // Run button
  runBtn.addEventListener("click", runSelectedFlows);

  // Stop button
  stopBtn.addEventListener("click", stopAllCommands);

  // Clear logs button
  clearLogsBtn.addEventListener("click", clearAllLogs);
}

// Set up IPC listeners
function setupIpcListeners() {
  // Listen for command output
  window.api.receive(
    "commandOutput",
    (data: { id: string; output: string }) => {
      appendCommandOutput(data.id, data.output);
    }
  );

  // Listen for command status changes
  window.api.receive("commandStatus", (result: CommandResult) => {
    updateCommandStatus(result);
  });

  // Listen for configuration updates
  window.api.receive("configUpdated", (config: DeploymentConfig) => {
    currentConfig = config;
    updateRootDirectoryDisplay();
    updateEnvironmentCheckboxes();
    updateFlowCheckboxes();
  });

  // Listen for error messages
  window.api.receive("error", (error: string) => {
    console.error("Error from main process:", error);
    // Maybe show an error toast or notification
  });
}

// Update root directory display
function updateRootDirectoryDisplay() {
  if (currentConfig.rootDirectory) {
    rootDirectoryInput.value = currentConfig.rootDirectory;
  } else {
    rootDirectoryInput.value = "";
    rootDirectoryInput.placeholder = "Select a directory...";
  }
}

// Update environment checkboxes based on current config
function updateEnvironmentCheckboxes() {
  envCheckboxes.forEach((checkbox) => {
    const env = checkbox.getAttribute("data-env") as Environment;
    checkbox.checked = currentConfig.selectedEnvironments.includes(env);
  });
}

// Update flow checkboxes based on current config
function updateFlowCheckboxes() {
  flowCheckboxes.forEach((checkbox) => {
    const flow = checkbox.getAttribute("data-flow") as Flow;
    checkbox.checked = currentConfig.selectedFlows.includes(flow);
  });
}

// Update selected environments when checkboxes change
function updateSelectedEnvironments() {
  const selectedEnvironments: Environment[] = [];

  envCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedEnvironments.push(
        checkbox.getAttribute("data-env") as Environment
      );
    }
  });

  currentConfig.selectedEnvironments = selectedEnvironments;

  // Save configuration
  window.api.invoke("saveConfig", currentConfig);
}

// Update selected flows when checkboxes change
function updateSelectedFlows() {
  const selectedFlows: Flow[] = [];

  flowCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedFlows.push(checkbox.getAttribute("data-flow") as Flow);
    }
  });

  currentConfig.selectedFlows = selectedFlows;

  // Save configuration
  window.api.invoke("saveConfig", currentConfig);
}

// Select a directory
async function selectDirectory() {
  try {
    const directory = await window.api.invoke<string | null>(
      "selectDirectory",
      null
    );

    if (directory) {
      currentConfig.rootDirectory = directory;
      updateRootDirectoryDisplay();

      // Save configuration
      window.api.invoke("saveConfig", currentConfig);
    }
  } catch (error) {
    console.error("Error selecting directory:", error);
  }
}

// Run selected flows for selected environments
async function runSelectedFlows() {
  const { selectedFlows, selectedEnvironments } = currentConfig;

  if (selectedFlows.length === 0) {
    alert("Please select at least one flow to run");
    return;
  }

  if (selectedEnvironments.length === 0) {
    alert("Please select at least one environment");
    return;
  }

  if (!currentConfig.rootDirectory) {
    alert("Please select a root directory first");
    return;
  }

  // Clear log display if no commands are running
  if (runningCommands.size === 0) {
    logTabsEl.innerHTML = "";
    logDisplayEl.innerHTML = "";
  }

  // Run each selected flow for each selected environment
  for (const flow of selectedFlows) {
    for (const env of selectedEnvironments) {
      try {
        const execId = await window.api.invoke<string>("runFlow", {
          flow,
          environment: env,
        });

        if (execId) {
          // Create a log tab for this command
          const flowConfig = FLOWS[flow];
          createLogTab(execId, flowConfig.name, env);
        }
      } catch (error) {
        console.error(
          `Error running flow ${flow} for environment ${env}:`,
          error
        );
      }
    }
  }
}

// Stop all running commands
async function stopAllCommands() {
  try {
    await window.api.invoke("stopAllCommands", null);
  } catch (error) {
    console.error("Error stopping commands:", error);
  }
}

// Create a log tab for a command
function createLogTab(
  commandId: string,
  flowName: string,
  environment: Environment
) {
  const tabEl = document.createElement("div");
  tabEl.className = "log-tab";
  tabEl.setAttribute("data-id", commandId);

  // Create status indicator
  const statusIndicator = document.createElement("span");
  statusIndicator.className = "status-indicator status-running";
  tabEl.appendChild(statusIndicator);

  // Add flow name
  const flowNameEl = document.createElement("span");
  flowNameEl.className = "flow-name";
  flowNameEl.textContent = flowName;
  tabEl.appendChild(flowNameEl);

  // Add environment badge
  const envBadge = document.createElement("span");
  envBadge.className = `environment-badge ${environment}`;
  envBadge.textContent = environment.toUpperCase();
  tabEl.appendChild(envBadge);

  // Add close button
  const closeBtn = document.createElement("span");
  closeBtn.className = "close-tab";
  closeBtn.textContent = "×";
  closeBtn.title = "Close tab";
  closeBtn.addEventListener("click", (e) => {
    closeLogTab(commandId, e);
  });
  tabEl.appendChild(closeBtn);

  // Add click event
  tabEl.addEventListener("click", () => {
    selectLogTab(commandId);
  });

  logTabsEl.appendChild(tabEl);

  // Select this tab
  selectLogTab(commandId);
}

// Select a log tab
function selectLogTab(commandId: string) {
  activeLogTab = commandId;

  // Update UI
  document.querySelectorAll(".log-tab").forEach((el) => {
    el.classList.remove("active");
    if (el.getAttribute("data-id") === commandId) {
      el.classList.add("active");
    }
  });

  // Show logs for this command
  showCommandLogs(commandId);
}

// Show logs for a command
function showCommandLogs(commandId: string) {
  const result = runningCommands.get(commandId);
  if (!result) return;

  // Format logs to handle ANSI color codes
  const formattedLogs = formatAnsiText(result.logs);

  // Update display with formatted logs
  logDisplayEl.innerHTML = formattedLogs;

  // Scroll to bottom
  logDisplayEl.scrollTop = logDisplayEl.scrollHeight;
}

// Initialize log display
function initializeLogDisplay() {
  // Set initial content
  logDisplayEl.innerHTML = `<div class="welcome-message">
      <h3>Deployment Logs</h3>
      <p>Select at least one flow and one environment, then click "Run Selected Flows" to begin.</p>
    </div>`;
}

// Clear all logs and tabs
function clearAllLogs() {
  // Clear all tabs
  logTabsEl.innerHTML = "";

  // Clear the log display
  initializeLogDisplay();

  // Clear running commands that are not active
  for (const [id, result] of runningCommands.entries()) {
    if (result.status !== "running") {
      runningCommands.delete(id);
    }
  }

  // Reset active tab
  activeLogTab = null;
}

// Close a single log tab
function closeLogTab(commandId: string, event?: Event) {
  // Prevent the click from propagating to the tab itself
  if (event) {
    event.stopPropagation();
  }

  // Remove tab element
  const tabEl = document.querySelector(`.log-tab[data-id="${commandId}"]`);
  if (tabEl) {
    tabEl.remove();
  }

  // If this was the active tab, select another tab or clear display
  if (activeLogTab === commandId) {
    const remainingTabs = document.querySelectorAll(".log-tab");
    if (remainingTabs.length > 0) {
      // Select the first remaining tab
      const newTabId = remainingTabs[0].getAttribute("data-id");
      if (newTabId) {
        selectLogTab(newTabId);
      }
    } else {
      // No tabs left, clear display
      activeLogTab = null;
      initializeLogDisplay();
    }
  }

  // Remove from running commands if not running
  const result = runningCommands.get(commandId);
  if (result && result.status !== "running") {
    runningCommands.delete(commandId);
  }
}

// Strip ANSI escape codes or convert them to HTML
function formatAnsiText(text: string): string {
  // Simple function to remove ANSI escape codes
  function stripAnsi(str: string): string {
    return str.replace(/\u001b\[\d+m/g, "");
  }

  // More advanced function to convert ANSI to HTML classes
  function ansiToHtml(str: string): string {
    // Replace ANSI escape sequences with spans
    let result = str
      // Bold
      .replace(/\u001b\[1m/g, '<span class="ansi-bold">')
      // Colors
      .replace(/\u001b\[30m/g, '<span class="ansi-black">')
      .replace(/\u001b\[31m/g, '<span class="ansi-red">')
      .replace(/\u001b\[32m/g, '<span class="ansi-green">')
      .replace(/\u001b\[33m/g, '<span class="ansi-yellow">')
      .replace(/\u001b\[34m/g, '<span class="ansi-blue">')
      .replace(/\u001b\[35m/g, '<span class="ansi-magenta">')
      .replace(/\u001b\[36m/g, '<span class="ansi-cyan">')
      .replace(/\u001b\[37m/g, '<span class="ansi-white">')
      // Bright colors
      .replace(/\u001b\[90m/g, '<span class="ansi-bright-black">')
      .replace(/\u001b\[91m/g, '<span class="ansi-bright-red">')
      .replace(/\u001b\[92m/g, '<span class="ansi-bright-green">')
      .replace(/\u001b\[93m/g, '<span class="ansi-bright-yellow">')
      .replace(/\u001b\[94m/g, '<span class="ansi-bright-blue">')
      .replace(/\u001b\[95m/g, '<span class="ansi-bright-magenta">')
      .replace(/\u001b\[96m/g, '<span class="ansi-bright-cyan">')
      .replace(/\u001b\[97m/g, '<span class="ansi-bright-white">')
      // Reset
      .replace(/\u001b\[0m/g, "</span>");

    // Remove any remaining escape sequences
    result = result.replace(/\u001b\[\d+m/g, "");

    return result;
  }

  // Remove the common escape sequences that don't convert well
  const cleanedText = text
    .replace(/\[2m/g, "") // Dim
    .replace(/\[22m/g, "") // Reset dim
    .replace(/\[\d+[A-Z]/g, ""); // Remove cursor movement commands

  // Convert to HTML
  return ansiToHtml(cleanedText);
}

// Append command output to logs
function appendCommandOutput(commandId: string, output: string) {
  const result = runningCommands.get(commandId);
  if (!result) return;

  // Update logs
  result.logs += output;
  runningCommands.set(commandId, result);

  // Update the display if this tab is active
  if (activeLogTab === commandId) {
    // Format the logs to handle ANSI color codes
    const formattedLogs = formatAnsiText(result.logs);

    // Update display with formatted logs
    logDisplayEl.innerHTML = formattedLogs;

    // Scroll to bottom
    logDisplayEl.scrollTop = logDisplayEl.scrollHeight;
  }
}

// Update command status
function updateCommandStatus(result: CommandResult) {
  runningCommands.set(result.id, result);

  // Update UI
  const tabEl = document.querySelector(`.log-tab[data-id="${result.id}"]`);
  if (!tabEl) return;

  // Update status indicator
  const statusIndicator = tabEl.querySelector(".status-indicator");
  if (statusIndicator) {
    statusIndicator.className = `status-indicator status-${result.status}`;
  }

  // If command is finished, remove from running commands if not active
  if (result.status !== "running" && activeLogTab !== result.id) {
    setTimeout(() => {
      if (runningCommands.has(result.id) && result.status !== "running") {
        runningCommands.delete(result.id);
      }
    }, 10000); // Keep finished commands for 10 seconds
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Export as a module
export {};
