import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css";
import App from "./components/App";
import { ipcService } from "./services";
import { useConfigStore } from "./stores";
import { DeploymentConfig } from "../types";

// Set up global error handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Find the root element
const container = document.getElementById("root");

// Ensure the container exists
if (!container) {
  throw new Error(
    'Root element not found! Add <div id="root"></div> to your HTML'
  );
}

// Set up listeners for config updates
ipcService.listen<DeploymentConfig>("configUpdated", (updatedConfig) => {
  console.log("Received updated config from main process:", updatedConfig);
  useConfigStore.setState({ config: updatedConfig, loading: false });
});

// Create a root
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("React renderer process loaded with Zustand state management");
