import React, { useEffect, useRef } from "react";
import { CommandResult } from "../../../types";
import { useCommands } from "../../hooks";

interface LogContentProps {
  activeCommand: CommandResult | null;
}

/**
 * Component for displaying command log content
 */
const LogContent: React.FC<LogContentProps> = ({ activeCommand }) => {
  const { formatAnsiText } = useCommands();
  const logDisplayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logDisplayRef.current) {
      logDisplayRef.current.scrollTop = logDisplayRef.current.scrollHeight;
    }
  }, [activeCommand?.logs]);

  // If no active command, show welcome message
  if (!activeCommand) {
    return (
      <div
        className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap bg-secondary dark:bg-darkAccent text-gray-800 dark:text-gray-100 rounded-bubble shadow-bubble dark:shadow-bubble-dark"
        ref={logDisplayRef}
      >
        <div className="text-center p-8 text-gray-400">
          <h3 className="mb-4 text-gray-800 dark:text-gray-100 font-medium">
            Deployment Logs
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Select at least one flow and one environment, then click "Run
            Selected Flows" to begin.
          </p>
        </div>
      </div>
    );
  }

  // Format logs with ANSI codes converted to HTML
  const formattedLogs = formatAnsiText(activeCommand.logs);

  return (
    <div
      className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap bg-secondary dark:bg-darkAccent text-gray-800 dark:text-gray-100 rounded-bubble shadow-bubble dark:shadow-bubble-dark"
      ref={logDisplayRef}
      dangerouslySetInnerHTML={{ __html: formattedLogs }}
    ></div>
  );
};

export default LogContent;
