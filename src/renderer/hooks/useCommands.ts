import { useState, useCallback, useEffect } from "react";
import { CommandResult, Environment, Flow } from "../../types";
import { useIpc } from "./useIpc";

/**
 * Hook for managing command execution
 */
export function useCommands() {
  const { invoke, useIpcListener } = useIpc();
  const [commandResults, setCommandResults] = useState<
    Map<string, CommandResult>
  >(new Map());
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);

  // Run a flow
  const runFlow = useCallback(
    async (flow: Flow, environment: Environment): Promise<string | null> => {
      try {
        const commandId = await invoke<string>("runFlow", {
          flow,
          environment,
        });
        if (commandId) {
          setActiveCommandId(commandId);
          return commandId;
        }
        return null;
      } catch (error) {
        console.error(
          `Error running flow ${flow} for environment ${environment}:`,
          error
        );
        return null;
      }
    },
    [invoke]
  );

  // Run selected flows for all selected environments
  const runSelectedFlows = useCallback(
    async (
      flows: Flow[],
      environments: Environment[],
      rootDirectory: string
    ) => {
      if (flows.length === 0) {
        throw new Error("Please select at least one flow to run");
      }

      if (environments.length === 0) {
        throw new Error("Please select at least one environment");
      }

      if (!rootDirectory) {
        throw new Error("Please select a root directory first");
      }

      // Clear command results if no commands are running
      if (commandResults.size === 0) {
        setCommandResults(new Map());
      }

      const commandIds: string[] = [];

      // Run each selected flow for each selected environment
      for (const flow of flows) {
        for (const env of environments) {
          const commandId = await runFlow(flow, env);
          if (commandId) {
            commandIds.push(commandId);
          }
        }
      }

      return commandIds;
    },
    [commandResults, runFlow]
  );

  // Stop a command
  const stopCommand = useCallback(
    async (commandId: string) => {
      try {
        await invoke("stopCommand", commandId);
        return true;
      } catch (error) {
        console.error("Error stopping command:", error);
        return false;
      }
    },
    [invoke]
  );

  // Stop all commands
  const stopAllCommands = useCallback(async () => {
    try {
      await invoke("stopAllCommands", null);
      return true;
    } catch (error) {
      console.error("Error stopping all commands:", error);
      return false;
    }
  }, [invoke]);

  // Clear command results
  const clearCommandResults = useCallback(() => {
    // Keep only running commands
    const newResults = new Map<string, CommandResult>();
    commandResults.forEach((result, id) => {
      if (result.status === "running") {
        newResults.set(id, result);
      }
    });
    setCommandResults(newResults);

    // Reset active command if it was cleared
    if (activeCommandId && !newResults.has(activeCommandId)) {
      setActiveCommandId(null);
    }
  }, [commandResults, activeCommandId]);

  // Close a specific command tab
  const closeCommandTab = useCallback(
    (commandId: string) => {
      const result = commandResults.get(commandId);
      if (!result || result.status !== "running") {
        const newResults = new Map(commandResults);
        newResults.delete(commandId);
        setCommandResults(newResults);

        // Reset active command if it was closed
        if (activeCommandId === commandId) {
          // Select the first available command
          const remainingIds = Array.from(newResults.keys());
          if (remainingIds.length > 0) {
            setActiveCommandId(remainingIds[0]);
          } else {
            setActiveCommandId(null);
          }
        }
      }
    },
    [commandResults, activeCommandId]
  );

  // Select a command to view its logs
  const selectCommand = useCallback(
    (commandId: string) => {
      if (commandResults.has(commandId)) {
        setActiveCommandId(commandId);
      }
    },
    [commandResults]
  );

  // Format ANSI text for display
  const formatAnsiText = useCallback((text: string): string => {
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
  }, []);

  // Get the active command
  const activeCommand = activeCommandId
    ? commandResults.get(activeCommandId) || null
    : null;

  // Listen for command output
  useIpcListener("commandOutput", (data: { id: string; output: string }) => {
    setCommandResults((prev) => {
      const newResults = new Map(prev);
      const result = newResults.get(data.id);

      if (result) {
        newResults.set(data.id, {
          ...result,
          logs: result.logs + data.output,
        });
      }

      return newResults;
    });
  });

  // Listen for command status updates
  useIpcListener("commandStatus", (result: CommandResult) => {
    setCommandResults((prev) => {
      const newResults = new Map(prev);
      newResults.set(result.id, result);
      return newResults;
    });

    // Auto-clean up finished commands after a delay
    if (result.status !== "running" && result.id !== activeCommandId) {
      const timeoutId = setTimeout(() => {
        setCommandResults((prev) => {
          const updatedResult = prev.get(result.id);
          if (updatedResult && updatedResult.status !== "running") {
            const newResults = new Map(prev);
            newResults.delete(result.id);
            return newResults;
          }
          return prev;
        });
      }, 10000); // Keep finished commands for 10 seconds

      // Clean up the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }
  });

  return {
    commandResults,
    activeCommandId,
    activeCommand,
    runFlow,
    runSelectedFlows,
    stopCommand,
    stopAllCommands,
    clearCommandResults,
    closeCommandTab,
    selectCommand,
    formatAnsiText,
  };
}
