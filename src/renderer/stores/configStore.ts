// src/renderer/stores/configStore.ts (Updated)
import { create } from "zustand";
import { DeploymentConfig, Environment, Flow } from "../../types";
import { configService } from "../services";

interface ConfigState {
  config: DeploymentConfig;
  loading: boolean;
  error: string | null;

  // Actions
  loadConfig: () => Promise<void>;
  selectProject: (projectName: string) => Promise<void>;
  selectRootDirectory: (projectName: string) => Promise<string | null>;
  updateSelectedEnvironments: (environments: Environment[]) => Promise<void>;
  updateSelectedFlows: (flows: Flow[]) => Promise<void>;
  saveConfig: (config: DeploymentConfig) => Promise<void>;
}

// Default config with empty values
const defaultConfig: DeploymentConfig = {
  projects: [],
  selectedProject: null,
  selectedEnvironments: [],
  selectedFlows: [],
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: { ...defaultConfig },
  loading: true,
  error: null,

  // Load config from main process
  loadConfig: async () => {
    try {
      set({ loading: true, error: null });
      const config = await configService.loadConfig();
      set({ config, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Failed to load config:", error);
    }
  },

  selectProject: async (projectName: string) => {
    try {
      // Don't set loading state for project selection
      // set({ loading: true, error: null }); <- Remove this line

      await configService.selectProject(projectName, get().config);

      // Just update the selected project without affecting loading state
      set((state) => ({
        config: { ...state.config, selectedProject: projectName },
        // loading: false, <- Remove this line
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error in selectProject:", error);
      throw error;
    }
  },

  // Select a root directory for the current project
  // Select Root Directory without setting loading state
  selectRootDirectory: async (projectName: string) => {
    try {
      // Don't set loading state for directory selection
      // set({ loading: true, error: null }); <- Remove this line

      const newPath = await configService.selectRootDirectory(
        projectName,
        get().config
      );

      if (newPath) {
        set((state) => {
          // Create a deep copy of projects array with the updated path
          const updatedProjects = state.config.projects.map((p) =>
            p.name === projectName ? { ...p, path: newPath } : p
          );

          return {
            config: { ...state.config, projects: updatedProjects },
            // loading: false, <- Remove this line
          };
        });
      }

      return newPath;
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error in selectRootDirectory:", error);
      throw error;
    }
  },
  // Update selected environments
  updateSelectedEnvironments: async (environments: Environment[]) => {
    try {
      // Don't set loading state for toggles
      // set({ loading: true, error: null }); <- Remove this line

      await configService.updateSelectedEnvironments(
        environments,
        get().config
      );

      // Just update the environments without affecting loading state
      set((state) => ({
        config: { ...state.config, selectedEnvironments: environments },
        // loading: false, <- Remove this line
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error in updateSelectedEnvironments:", error);
      throw error;
    }
  },

  // Update selected flows
  updateSelectedFlows: async (flows: Flow[]) => {
    try {
      // Don't set loading state for toggles
      // set({ loading: true, error: null }); <- Remove this line

      await configService.updateSelectedFlows(flows, get().config);

      // Just update the flows without affecting loading state
      set((state) => ({
        config: { ...state.config, selectedFlows: flows },
        // loading: false, <- Remove this line
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error in updateSelectedFlows:", error);
      throw error;
    }
  },
  // Save the entire config
  saveConfig: async (config: DeploymentConfig) => {
    try {
      set({ loading: true, error: null });
      await configService.saveConfig(config);
      set({ config, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error in saveConfig:", error);
      throw error;
    }
  },
}));
