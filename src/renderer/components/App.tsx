import React, { useEffect, useState } from "react";
import { useConfigStore, useNotificationStore } from "../stores";
import Sidebar from "./Sidebar/Sidebar";
import LogDisplay from "./LogDisplay/LogDisplay";
import Notification from "./UI/Notification";
import { ipcService } from "../services";

const App: React.FC = () => {
  // Only get the loading state for initial load
  const { loading, loadConfig } = useConfigStore();

  // Track initial loading state separately
  const [initialLoading, setInitialLoading] = useState(true);

  const { notifications, addNotification, removeNotification } =
    useNotificationStore();

  // Listen for errors from the main process
  useEffect(() => {
    const cleanup = ipcService.listen("error", (message: string) => {
      addNotification(message, "error");
    });

    return cleanup;
  }, [addNotification]);

  // Load config on component mount and track initial loading
  useEffect(() => {
    const initialize = async () => {
      await loadConfig();
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setInitialLoading(false);
      }, 100);
    };

    initialize();
  }, [loadConfig]);

  // Only show loading screen on initial load
  if (loading && initialLoading) {
    return (
      <div className="flex justify-center items-center h-full text-lg text-primary">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-row flex-grow overflow-hidden">
        {/* Simplified component structure - no more prop drilling */}
        <Sidebar />
        <LogDisplay />
      </div>

      {/* Render notification components */}
      <div className="fixed top-5 right-5 w-[300px] max-w-[80%] z-20 flex flex-col">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            variant={notification.type}
            onClose={removeNotification}
            autoClose={notification.autoClose}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
