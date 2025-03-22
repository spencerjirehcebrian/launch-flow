import React from "react";
import { CommandResult } from "../../../types";

interface CommandWithId extends CommandResult {
  commandId: string;
}

interface LogTabsProps {
  commands: CommandWithId[];
  activeCommandId: string | null;
  onSelectCommand: (commandId: string) => void;
  onCloseCommandTab: (commandId: string) => void;
  getFlowName?: (flow: string) => string;
}

/**
 * Component for displaying log tabs
 */
const LogTabs: React.FC<LogTabsProps> = ({
  commands,
  activeCommandId,
  onSelectCommand,
  onCloseCommandTab,
  getFlowName = (flow) => flow,
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
    return (
      <div className="flex bg-secondary dark:bg-darkCard border-b border-pink-200 dark:border-darkAccent animate-fadeIn"></div>
    );
  }

  return (
    <div className="flex bg-secondary dark:bg-darkCard border-b border-pink-200 dark:border-darkAccent overflow-x-auto animate-slideInDown">
      {commands.map((command) => {
        const isActive = command.commandId === activeCommandId;

        return (
          <div
            key={command.commandId}
            className={`relative py-3 px-4 pr-8 whitespace-nowrap cursor-pointer border-r border-pink-200 dark:border-darkAccent transition-colors duration-200
              ${
                isActive
                  ? "bg-gradient-pink-bubble text-secondary dark:text-gray-100" // Primary Pink with White text when active
                  : "hover:bg-pink-50 dark:hover:bg-darkAccent/20" // Lighter hover effect
              }`}
            data-id={command.commandId}
            onClick={() => onSelectCommand(command.commandId)}
          >
            {/* Status indicator */}
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5
                ${
                  command.status === "running"
                    ? "bg-blue-500 animate-pulse"
                    : ""
                }
                ${command.status === "success" ? "bg-green-500" : ""}
                ${command.status === "error" ? "bg-red-500" : ""}
                ${command.status === "stopped" ? "bg-gray-500" : ""}`}
            ></span>

            {/* Flow name */}
            <span className="font-medium">{getFlowName(command.flow)}</span>

            {/* Environment badge */}
            <span
              className={`inline-block ml-1 text-xs py-0.5 px-1.5 rounded-md font-medium
                ${command.environment === "dev" ? "bg-blue-500 text-white" : ""}
                ${command.environment === "qa" ? "bg-amber-500 text-white" : ""}
                ${
                  command.environment === "stg"
                    ? "bg-purple-500 text-white"
                    : ""
                }
                ${
                  command.environment === "prod" ? "bg-red-500 text-white" : ""
                }`}
            >
              {command.environment.toUpperCase()}
            </span>

            {/* Close button */}
            <span
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full
                ${
                  isActive
                    ? "bg-white/20 text-secondary dark:text-gray-100 hover:bg-white/30"
                    : "bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/20 dark:hover:bg-white/20"
                }
                cursor-pointer transition-colors duration-200`}
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
