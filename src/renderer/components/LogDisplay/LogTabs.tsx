import React from "react";
import { CommandResult, FLOWS } from "../../../types";

// Updated interface to match the new data structure
interface CommandWithId extends CommandResult {
  commandId: string;
}

interface LogTabsProps {
  commands: CommandWithId[];
  activeCommandId: string | null;
  onSelectCommand: (commandId: string) => void;
  onCloseCommandTab: (commandId: string) => void;
}

/**
 * Component for displaying log tabs
 */
const LogTabs: React.FC<LogTabsProps> = ({
  commands,
  activeCommandId,
  onSelectCommand,
  onCloseCommandTab,
}) => {
  // Handle close button click
  const handleCloseClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    commandId: string
  ) => {
    e.stopPropagation(); // Prevent triggering the tab selection
    onCloseCommandTab(commandId);
  };

  if (commands.length === 0) {
    return <div className="log-tabs"></div>;
  }

  return (
    <div className="log-tabs">
      {commands.map((command) => {
        const flowConfig = FLOWS[command.flow];
        const isActive = command.commandId === activeCommandId;

        return (
          <div
            key={command.commandId}
            className={`log-tab ${isActive ? "active" : ""}`}
            data-id={command.commandId}
            onClick={() => onSelectCommand(command.commandId)}
          >
            {/* Status indicator */}
            <span
              className={`status-indicator status-${command.status}`}
            ></span>

            {/* Flow name */}
            <span className="flow-name">{flowConfig.name}</span>

            {/* Environment badge */}
            <span className={`environment-badge ${command.environment}`}>
              {command.environment.toUpperCase()}
            </span>

            {/* Close button */}
            <span
              className="close-tab"
              title="Close tab"
              onClick={(e) => handleCloseClick(e, command.commandId)}
            >
              ×
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LogTabs;
