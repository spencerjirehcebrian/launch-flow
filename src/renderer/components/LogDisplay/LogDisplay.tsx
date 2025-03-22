// src/renderer/components/LogDisplay/LogDisplay.tsx (Refactored version)
import React from "react";
import LogTabs from "./LogTabs";
import LogContent from "./LogContent";
import { useCommandStore, useConfigStore } from "../../stores";

/**
 * Component for displaying command logs with tabs - now connected directly to stores
 */
const LogDisplay: React.FC = () => {
  const { commandResults, activeCommandId, selectCommand, closeCommandTab } =
    useCommandStore();

  const { config } = useConfigStore();

  const activeCommand = activeCommandId
    ? commandResults.get(activeCommandId) || null
    : null;

  const commandArray = Array.from(commandResults.entries()).map(
    ([id, result]) => ({ commandId: id, ...result })
  );

  // Function to get flow name from the selected project's flows
  const getFlowName = (flow: string): string => {
    const selectedProject = config.projects.find(
      (p) => p.name === config.selectedProject
    );
    return selectedProject?.flows[flow]?.name || flow; // Fallback to flow ID if not found
  };

  return (
    <div className="flex-1 flex flex-col bg-secondary dark:bg-darkCard overflow-hidden rounded-bubble border border-pink-100 dark:border-darkAccent shadow-bubble dark:shadow-bubble-dark m-4 ml-0 transition-all duration-300">
      <div className="flex-1 flex flex-col overflow-hidden">
        <LogTabs
          commands={commandArray}
          activeCommandId={activeCommandId}
          onSelectCommand={selectCommand}
          onCloseCommandTab={closeCommandTab}
          getFlowName={getFlowName}
        />

        <LogContent activeCommand={activeCommand} />
      </div>
    </div>
  );
};

export default LogDisplay;
