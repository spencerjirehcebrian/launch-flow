import React from "react";
import { CommandResult } from "../../../types";
import LogTabs from "./LogTabs";
import LogContent from "./LogContent";

interface LogDisplayProps {
  commandResults: Map<string, CommandResult>;
  activeCommandId: string | null;
  onSelectCommand: (commandId: string) => void;
  onCloseCommandTab: (commandId: string) => void;
  onClearLogs: () => void;
}

/**
 * Component for displaying command logs with tabs
 */
const LogDisplay: React.FC<LogDisplayProps> = ({
  commandResults,
  activeCommandId,
  onSelectCommand,
  onCloseCommandTab,
  onClearLogs,
}) => {
  // Get the active command result
  const activeCommand = activeCommandId
    ? commandResults.get(activeCommandId) || null
    : null;

  // Convert Map to array for easier rendering
  const commandArray = Array.from(commandResults.entries()).map(
    ([id, result]) => ({ commandId: id, ...result })
  );

  return (
    <div className="main-content">
      <div className="log-container">
        <LogTabs
          commands={commandArray}
          activeCommandId={activeCommandId}
          onSelectCommand={onSelectCommand}
          onCloseCommandTab={onCloseCommandTab}
        />

        <div className="log-actions">
          <button
            id="clear-logs-btn"
            className="action-btn small"
            onClick={onClearLogs}
          >
            Clear All Logs
          </button>
        </div>

        <LogContent activeCommand={activeCommand} />
      </div>
    </div>
  );
};

export default LogDisplay;
