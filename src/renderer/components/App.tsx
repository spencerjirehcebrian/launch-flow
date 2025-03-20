import React, { useState, useEffect } from "react";
import { useConfig, useCommands, useError } from "../hooks";
import Sidebar from "./Sidebar/Sidebar";
import LogDisplay from "./LogDisplay/LogDisplay";

/**
 * Main App component
 */
const App: React.FC = () => {
  // Use our custom hooks
  const {
    config,
    loading: configLoading,
    selectRootDirectory,
    updateSelectedEnvironments,
    updateSelectedFlows,
  } = useConfig();

  const {
    commandResults,
    activeCommandId,
    activeCommand,
    runSelectedFlows,
    stopAllCommands,
    clearCommandResults,
    closeCommandTab,
    selectCommand,
  } = useCommands();

  const { errors, clearError } = useError();

  // Handle running multiple flows
  const handleRunSelectedFlows = async () => {
    try {
      await runSelectedFlows(
        config.selectedFlows,
        config.selectedEnvironments,
        config.rootDirectory
      );
    } catch (error) {
      // This will show an alert with the error message
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  // If configuration is loading, show a loading indicator
  if (configLoading) {
    return <div className="loading">Loading configuration...</div>;
  }

  console.log("Rendering App component with Sidebar and LogDisplay");

  return (
    <div className="container">
      {/* Sidebar with configuration options */}
      <Sidebar
        rootDirectory={config.rootDirectory}
        selectedEnvironments={config.selectedEnvironments}
        selectedFlows={config.selectedFlows}
        onSelectDirectory={selectRootDirectory}
        onUpdateEnvironments={updateSelectedEnvironments}
        onUpdateFlows={updateSelectedFlows}
        onRunFlows={handleRunSelectedFlows}
        onStopAllCommands={stopAllCommands}
      />

      {/* Main content with log display */}
      <LogDisplay
        commandResults={commandResults}
        activeCommandId={activeCommandId}
        onSelectCommand={selectCommand}
        onCloseCommandTab={closeCommandTab}
        onClearLogs={clearCommandResults}
      />

      {/* Error display */}
      {errors.length > 0 && (
        <div className="error-container">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <span>{error}</span>
              <button onClick={() => clearError(index)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;