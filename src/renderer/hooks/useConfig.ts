// src/renderer/hooks/useConfig.ts
import { useState, useEffect, useCallback } from "react";
import { DeploymentConfig, Environment, Flow } from "../../types";
import { useIpc } from "./useIpc";

export function useConfig() {
  const { invoke, useIpcListener } = useIpc();
  const [config, setConfig] = useState<DeploymentConfig>({
    projects: [],
    selectedProject: null,
    selectedEnvironments: [],
    selectedFlows: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const loadedConfig = await invoke<DeploymentConfig>("loadConfig", null);
        setConfig(loadedConfig);
      } catch (error) {
        console.error("Failed to load config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [invoke]);

  const saveConfig = useCallback(
    async (newConfig: DeploymentConfig) => {
      try {
        await invoke("saveConfig", newConfig);
        setConfig(newConfig);
      } catch (error) {
        console.error("Failed to save config:", error);
        throw error; // Re-throw to allow error handling in calling functions
      }
    },
    [invoke]
  );

  const selectRootDirectory = useCallback(
    async (projectName: string) => {
      try {
        const directory = await invoke<string | null>("selectDirectory", null);

        // Only proceed if a directory was selected and a project name is provided
        if (directory && projectName) {
          console.log(`Updating project ${projectName} path to: ${directory}`);

          // Create a deep copy of projects array
          const updatedProjects = config.projects.map((p) =>
            p.name === projectName ? { ...p, path: directory } : p
          );

          // Create new config object with updated projects
          const updatedConfig = { ...config, projects: updatedProjects };

          // Save and update the config
          console.log("Saving updated config:", updatedConfig);
          await saveConfig(updatedConfig);

          return directory;
        }
        return null;
      } catch (error) {
        console.error("Error selecting directory:", error);
        throw error;
      }
    },
    [config, invoke, saveConfig]
  );

  const updateSelectedEnvironments = useCallback(
    async (environments: Environment[]) => {
      try {
        const updatedConfig = { ...config, selectedEnvironments: environments };
        await saveConfig(updatedConfig);
      } catch (error) {
        console.error("Failed to update environments:", error);
        throw error;
      }
    },
    [config, saveConfig]
  );

  const updateSelectedFlows = useCallback(
    async (flows: Flow[]) => {
      try {
        const updatedConfig = { ...config, selectedFlows: flows };
        await saveConfig(updatedConfig);
      } catch (error) {
        console.error("Failed to update flows:", error);
        throw error;
      }
    },
    [config, saveConfig]
  );

  useIpcListener("configUpdated", (updatedConfig: DeploymentConfig) => {
    console.log("Received updated config from main process:", updatedConfig);
    setConfig(updatedConfig);
    setLoading(false); // Ensure loading is false after update
  });

  return {
    config,
    loading,
    selectRootDirectory,
    updateSelectedEnvironments,
    updateSelectedFlows,
    saveConfig,
  };
}
