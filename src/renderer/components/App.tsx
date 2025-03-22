// src/renderer/components/App.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useConfig, useCommands, useError } from "../hooks";
import Sidebar from "./Sidebar/Sidebar";
import LogDisplay from "./LogDisplay/LogDisplay";
import Header from "./Header";
import Notification, { NotificationVariant } from "./UI/Notification";

interface NotificationItem {
  id: string;
  message: string;
  variant: NotificationVariant;
}

const App: React.FC = () => {
  const {
    config,
    loading,
    selectRootDirectory,
    updateSelectedEnvironments,
    updateSelectedFlows,
    saveConfig,
  } = useConfig();
  const {
    commandResults,
    activeCommandId,
    runSelectedFlows,
    stopAllCommands,
    clearCommandResults,
    closeCommandTab,
    selectCommand,
  } = useCommands();
  const { errors, clearError, addError } = useError();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback(
    (message: string, variant: NotificationVariant) => {
      const id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15); // Generate unique ID
      setNotifications((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const closeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const showNotificationForError = (index: number) => {
      if (errors.length > 0 && index < errors.length) {
        showNotification(errors[index].message, "error");
        clearError(index);
      }
    };

    if (errors.length > 0) {
      showNotificationForError(0);
    }
  }, [errors, showNotification, clearError]);

  const handleSelectProject = async (projectName: string) => {
    try {
      const updatedConfig = { ...config, selectedProject: projectName };
      await saveConfig(updatedConfig);
      showNotification(
        `Project "${projectName}" selected successfully!`,
        "success"
      );
    } catch (error: any) {
      console.error("Error in handleSelectProject:", error);
      showNotification(`Error selecting project: ${error.message}`, "error");
    }
  };

  const handleSelectDirectory = async (projectName: string) => {
    try {
      const newPath = await selectRootDirectory(projectName);
      if (newPath) {
        showNotification(`Root directory updated to: ${newPath}`, "success");
      }
      return newPath;
    } catch (error: any) {
      console.error("Error selecting directory:", error);
      showNotification(`Error selecting directory: ${error.message}`, "error");
      return null;
    }
  };

  const handleUpdateEnvironments = async (environments: string[]) => {
    try {
      await updateSelectedEnvironments(environments);
      showNotification(`Selected environments updated`, "info");
    } catch (error: any) {
      console.error("Error updating environments:", error);
      showNotification(
        `Error updating environments: ${error.message}`,
        "error"
      );
    }
  };

  const handleUpdateFlows = async (flows: string[]) => {
    try {
      await updateSelectedFlows(flows);
      showNotification(`Selected flows updated`, "info");
    } catch (error: any) {
      console.error("Error updating flows:", error);
      showNotification(`Error updating flows: ${error.message}`, "error");
    }
  };

  const handleRunSelectedFlows = async () => {
    try {
      const selectedProject = config.projects.find(
        (p) => p.name === config.selectedProject
      );
      if (!selectedProject) throw new Error("No project selected");

      if (config.selectedFlows.length === 0) {
        throw new Error("Please select at least one flow to run");
      }

      if (config.selectedEnvironments.length === 0) {
        throw new Error("Please select at least one environment");
      }

      await runSelectedFlows(
        config.selectedFlows,
        config.selectedEnvironments,
        selectedProject.path
      );
      showNotification("Flows started successfully!", "success");
    } catch (error: any) {
      console.error("Error in handleRunSelectedFlows:", error);
      showNotification(error.message, "error");
    }
  };

  const handleClearLogs = () => {
    clearCommandResults();
    showNotification("Command logs cleared", "info");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-lg text-primary">
        Loading configuration...
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-row flex-grow overflow-hidden">
        <Sidebar
          projects={config.projects}
          selectedProject={config.selectedProject}
          selectedEnvironments={config.selectedEnvironments}
          selectedFlows={config.selectedFlows}
          onSelectProject={handleSelectProject}
          onSelectDirectory={handleSelectDirectory}
          onUpdateEnvironments={handleUpdateEnvironments}
          onUpdateFlows={handleUpdateFlows}
          onRunFlows={handleRunSelectedFlows}
          onStopAllCommands={stopAllCommands}
          onClearLogs={handleClearLogs}
        />

        <LogDisplay
          commandResults={commandResults}
          activeCommandId={activeCommandId}
          config={config}
          onSelectCommand={selectCommand}
          onCloseCommandTab={closeCommandTab}
          onClearLogs={clearCommandResults}
        />
      </div>

      {/* Render notification components */}
      <div className="fixed top-5 right-5 w-[300px] max-w-[80%] z-20 flex flex-col">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            variant={notification.variant}
            onClose={closeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
