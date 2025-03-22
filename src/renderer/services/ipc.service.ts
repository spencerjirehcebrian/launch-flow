// src/renderer/services/ipc.service.ts (Refactored)
import { Environment, Flow } from "../../types";

/**
 * Service for handling IPC communication with the main process
 * - Provides a clean interface for IPC operations
 * - Encapsulates the electron IPC implementation details
 */
export class IpcService {
  private static instance: IpcService;

  private constructor() {}

  public static getInstance(): IpcService {
    if (!IpcService.instance) {
      IpcService.instance = new IpcService();
    }
    return IpcService.instance;
  }

  /**
   * Send a message to the main process (fire and forget)
   */
  public send(channel: string, data: any): void {
    window.api.send(channel, data);
  }

  /**
   * Invoke a method in the main process and receive a response
   * @template T The expected return type
   */
  public async invoke<T>(channel: string, data: any): Promise<T> {
    try {
      return await window.api.invoke<T>(channel, data);
    } catch (error) {
      console.error(`IPC invoke error (${channel}):`, error);
      throw error;
    }
  }

  /**
   * Set up a listener for messages from the main process
   * @returns A cleanup function to remove the listener
   */
  public listen<T>(channel: string, callback: (data: T) => void): () => void {
    window.api.receive(channel, callback);
    return () => {
      window.api.removeAllListeners(channel);
    };
  }

  /**
   * Load config from main process
   */
  public async loadConfig<T>(): Promise<T> {
    return this.invoke<T>("loadConfig", null);
  }

  /**
   * Save config via main process
   */
  public async saveConfig<T>(config: T): Promise<boolean> {
    return this.invoke<boolean>("saveConfig", config);
  }

  /**
   * Run a flow for a specific environment
   */
  public async runFlow(
    flow: Flow,
    environment: Environment
  ): Promise<string | null> {
    return this.invoke<string | null>("runFlow", { flow, environment });
  }

  /**
   * Stop a running command
   */
  public async stopCommand(commandId: string): Promise<boolean> {
    return this.invoke<boolean>("stopCommand", commandId);
  }

  /**
   * Stop all running commands
   */
  public async stopAllCommands(): Promise<boolean> {
    return this.invoke<boolean>("stopAllCommands", null);
  }

  /**
   * Select a directory using the native dialog
   */
  public async selectDirectory(): Promise<string | null> {
    return this.invoke<string | null>("selectDirectory", null);
  }
}

// Singleton instance
export const ipcService = IpcService.getInstance();
