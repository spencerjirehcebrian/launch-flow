// src/renderer/services/config.service.ts (Refactored)
import { DeploymentConfig, Environment, Flow } from "../../types";
import { ipcService } from "./ipc.service";

/**
 * Service for managing application configuration
 * - Handles loading and saving configuration
 * - Provides methods for updating config sections
 */
export class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Load configuration from main process
   */
  public async loadConfig(): Promise<DeploymentConfig> {
    try {
      return await ipcService.loadConfig<DeploymentConfig>();
    } catch (error) {
      console.error("Error loading configuration:", error);
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Save configuration to main process
   */
  public async saveConfig(config: DeploymentConfig): Promise<void> {
    try {
      await ipcService.saveConfig(config);
    } catch (error) {
      console.error("Error saving configuration:", error);
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Select a root directory for a project
   * Updates the project path in the config
   *
   * @returns The new path if selected, null if canceled
   */
  public async selectRootDirectory(
    projectName: string,
    currentConfig: DeploymentConfig
  ): Promise<string | null> {
    try {
      const directory = await ipcService.selectDirectory();

      if (directory && projectName) {
        // Create a new config with the updated project path
        const updatedProjects = currentConfig.projects.map((p) =>
          p.name === projectName ? { ...p, path: directory } : p
        );

        const updatedConfig = { ...currentConfig, projects: updatedProjects };
        await this.saveConfig(updatedConfig);
        return directory;
      }
      return null;
    } catch (error) {
      console.error("Error selecting directory:", error);
      throw new Error(`Failed to select directory: ${error}`);
    }
  }

  /**
   * Update selected environments in the config
   */
  public async updateSelectedEnvironments(
    environments: Environment[],
    currentConfig: DeploymentConfig
  ): Promise<void> {
    try {
      const updatedConfig = {
        ...currentConfig,
        selectedEnvironments: environments,
      };
      await this.saveConfig(updatedConfig);
    } catch (error) {
      console.error("Error updating environments:", error);
      throw new Error(`Failed to update environments: ${error}`);
    }
  }

  /**
   * Update selected flows in the config
   */
  public async updateSelectedFlows(
    flows: Flow[],
    currentConfig: DeploymentConfig
  ): Promise<void> {
    try {
      const updatedConfig = { ...currentConfig, selectedFlows: flows };
      await this.saveConfig(updatedConfig);
    } catch (error) {
      console.error("Error updating flows:", error);
      throw new Error(`Failed to update flows: ${error}`);
    }
  }

  /**
   * Select a project and update the config
   */
  public async selectProject(
    projectName: string,
    currentConfig: DeploymentConfig
  ): Promise<void> {
    try {
      const updatedConfig = { ...currentConfig, selectedProject: projectName };
      await this.saveConfig(updatedConfig);
    } catch (error) {
      console.error("Error selecting project:", error);
      throw new Error(`Failed to select project: ${error}`);
    }
  }
}

// Singleton instance
export const configService = ConfigService.getInstance();
