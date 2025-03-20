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
      <div className="log-display" ref={logDisplayRef}>
        <div className="welcome-message">
          <h3>Deployment Logs</h3>
          <p>
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
      className="log-display"
      ref={logDisplayRef}
      dangerouslySetInnerHTML={{ __html: formattedLogs }}
    ></div>
  );
};

export default LogContent;
