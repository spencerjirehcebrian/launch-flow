// src/renderer/services/command.service.ts (Refactored)
import { CommandResult, Environment, Flow } from "../../types";
import { ipcService } from "./ipc.service";

/**
 * Service for managing command execution
 * - Handles flow execution and command management
 * - Provides utilities for command output formatting
 */
export class CommandService {
  private static instance: CommandService;

  private constructor() {}

  public static getInstance(): CommandService {
    if (!CommandService.instance) {
      CommandService.instance = new CommandService();
    }
    return CommandService.instance;
  }

  /**
   * Run a flow for a specific environment
   * @returns The command ID if successful, null otherwise
   */
  public async runFlow(
    flow: Flow,
    environment: Environment
  ): Promise<string | null> {
    try {
      return await ipcService.runFlow(flow, environment);
    } catch (error) {
      console.error(`Error running flow ${flow} for ${environment}:`, error);
      throw new Error(`Failed to run flow: ${error}`);
    }
  }

  /**
   * Run selected flows for all selected environments
   * @returns Array of command IDs that were started
   */
  public async runSelectedFlows(
    flows: Flow[],
    environments: Environment[],
    rootDirectory: string
  ): Promise<string[]> {
    if (!flows.length) {
      throw new Error("Please select at least one flow to run");
    }

    if (!environments.length) {
      throw new Error("Please select at least one environment");
    }

    if (!rootDirectory) {
      throw new Error("Please select a root directory first");
    }

    const commandIds: string[] = [];

    try {
      // Run each selected flow for each selected environment
      for (const flow of flows) {
        for (const env of environments) {
          const commandId = await this.runFlow(flow, env);
          if (commandId) commandIds.push(commandId);
        }
      }

      return commandIds;
    } catch (error) {
      console.error("Error running selected flows:", error);
      throw new Error(`Failed to run selected flows: ${error}`);
    }
  }

  /**
   * Stop a command
   * @returns True if successful, false otherwise
   */
  public async stopCommand(commandId: string): Promise<boolean> {
    try {
      return await ipcService.stopCommand(commandId);
    } catch (error) {
      console.error(`Error stopping command ${commandId}:`, error);
      throw new Error(`Failed to stop command: ${error}`);
    }
  }

  /**
   * Stop all commands
   * @returns True if successful, false otherwise
   */
  public async stopAllCommands(): Promise<boolean> {
    try {
      return await ipcService.stopAllCommands();
    } catch (error) {
      console.error("Error stopping all commands:", error);
      throw new Error(`Failed to stop all commands: ${error}`);
    }
  }

  /**
   * Format ANSI text for display
   * Converts ANSI escape sequences to HTML
   */
  public formatAnsiText(text: string): string {
    if (!text) return "";

    // Clean up common escape sequences
    const cleanedText = text
      .replace(/\[2m/g, "") // Dim
      .replace(/\[22m/g, "") // Reset dim
      .replace(/\[\d+[A-Z]/g, ""); // Remove cursor movement commands

    // Replace ANSI escape sequences with spans
    let result = cleanedText
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
}

// Singleton instance
export const commandService = CommandService.getInstance();
