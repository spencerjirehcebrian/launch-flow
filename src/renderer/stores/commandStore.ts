// src/renderer/stores/commandStore.ts (Updated)
import { create } from "zustand";
import { CommandResult, Environment, Flow } from "../../types";
import { commandService } from "../services";
import { ipcService } from "../services";

interface CommandState {
  commandResults: Map<string, CommandResult>;
  activeCommandId: string | null;

  // Actions
  runFlow: (flow: Flow, environment: Environment) => Promise<string | null>;
  runSelectedFlows: (
    flows: Flow[],
    environments: Environment[],
    rootDirectory: string
  ) => Promise<string[]>;
  stopCommand: (commandId: string) => Promise<boolean>;
  stopAllCommands: () => Promise<boolean>;
  clearCommandResults: () => void;
  closeCommandTab: (commandId: string) => void;
  selectCommand: (commandId: string) => void;
  updateCommandOutput: (id: string, output: string) => void;
  updateCommandStatus: (result: CommandResult) => void;
  formatAnsiText: (text: string) => string;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  commandResults: new Map<string, CommandResult>(),
  activeCommandId: null,

  // Run a flow and capture the command ID
  runFlow: async (flow: Flow, environment: Environment) => {
    try {
      const commandId = await commandService.runFlow(flow, environment);
      if (commandId) {
        set({ activeCommandId: commandId });
      }
      return commandId;
    } catch (error) {
      console.error(`Error in runFlow:`, error);
      return null;
    }
  },

  // Run selected flows for all selected environments
  runSelectedFlows: async (
    flows: Flow[],
    environments: Environment[],
    rootDirectory: string
  ) => {
    try {
      return await commandService.runSelectedFlows(
        flows,
        environments,
        rootDirectory
      );
    } catch (error) {
      console.error("Error in runSelectedFlows:", error);
      throw error;
    }
  },

  // Stop a specific command
  stopCommand: async (commandId: string) => {
    try {
      return await commandService.stopCommand(commandId);
    } catch (error) {
      console.error("Error in stopCommand:", error);
      return false;
    }
  },

  // Stop all running commands
  stopAllCommands: async () => {
    try {
      return await commandService.stopAllCommands();
    } catch (error) {
      console.error("Error in stopAllCommands:", error);
      return false;
    }
  },

  // Clear all completed command results
  clearCommandResults: () => {
    set((state) => {
      // Keep only running commands
      const newResults = new Map<string, CommandResult>();
      state.commandResults.forEach((result, id) => {
        if (result.status === "running") {
          newResults.set(id, result);
        }
      });

      // Reset active command if it was cleared
      const newActiveCommandId =
        state.activeCommandId && newResults.has(state.activeCommandId)
          ? state.activeCommandId
          : newResults.size > 0
          ? Array.from(newResults.keys())[0]
          : null;

      return {
        commandResults: newResults,
        activeCommandId: newActiveCommandId,
      };
    });
  },

  // Close a specific command tab
  closeCommandTab: (commandId: string) => {
    set((state) => {
      const result = state.commandResults.get(commandId);
      if (!result || result.status !== "running") {
        const newResults = new Map(state.commandResults);
        newResults.delete(commandId);

        // Reset active command if it was closed
        let newActiveCommandId = state.activeCommandId;
        if (state.activeCommandId === commandId) {
          // Select the first available command
          const remainingIds = Array.from(newResults.keys());
          newActiveCommandId = remainingIds.length > 0 ? remainingIds[0] : null;
        }

        return {
          commandResults: newResults,
          activeCommandId: newActiveCommandId,
        };
      }
      return state;
    });
  },

  // Select a command to view
  selectCommand: (commandId: string) => {
    set((state) => {
      if (state.commandResults.has(commandId)) {
        return { activeCommandId: commandId };
      }
      return state;
    });
  },

  // Update command output (used by IPC listeners)
  updateCommandOutput: (id: string, output: string) => {
    set((state) => {
      const newResults = new Map(state.commandResults);
      const result = newResults.get(id);

      if (result) {
        newResults.set(id, {
          ...result,
          logs: result.logs + output,
        });
      } else {
        // If the command isn't in our results yet, create a new entry
        newResults.set(id, {
          id,
          flow: "unknown", // Will be updated when full status update comes in
          environment: "unknown", // Will be updated when full status update comes in
          directory: "",
          status: "running",
          logs: output,
          startTime: Date.now(),
        });
      }

      return { commandResults: newResults };
    });
  },

  // Update command status (used by IPC listeners)
  updateCommandStatus: (result: CommandResult) => {
    set((state) => {
      const newResults = new Map(state.commandResults);
      newResults.set(result.id, result);
      return { commandResults: newResults };
    });
  },

  // Format ANSI text for display
  formatAnsiText: (text: string) => {
    return commandService.formatAnsiText(text);
  },
}));

// Set up listeners for command events
ipcService.listen("commandOutput", (data: { id: string; output: string }) => {
  useCommandStore.getState().updateCommandOutput(data.id, data.output);
});

ipcService.listen("commandStatus", (result: CommandResult) => {
  useCommandStore.getState().updateCommandStatus(result);
});
