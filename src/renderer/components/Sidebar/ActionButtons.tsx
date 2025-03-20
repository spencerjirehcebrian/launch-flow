import React from "react";

interface ActionButtonsProps {
  onRunFlows: () => Promise<void>;
  onStopAllCommands: () => Promise<boolean>;
}

/**
 * Component for action buttons (run, stop)
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRunFlows,
  onStopAllCommands,
}) => {
  return (
    <>
      <button className="action-btn primary" onClick={onRunFlows}>
        Run Selected Flows
      </button>
      <button className="action-btn danger" onClick={onStopAllCommands}>
        Stop All
      </button>
    </>
  );
};

export default ActionButtons;
