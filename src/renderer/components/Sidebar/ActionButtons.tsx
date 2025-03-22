import React from "react";
import Button from "../UI/Buttons";

interface ActionButtonsProps {
  onRunFlows: () => Promise<void>;
  onStopAllCommands: () => Promise<boolean>;
  onClearLogs: () => void;
}

/**
 * Component for action buttons (run, stop)
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRunFlows,
  onStopAllCommands,
  onClearLogs,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Button variant="primary" onClick={onRunFlows}>
        Run Selected Flows
      </Button>
      <Button variant="danger" onClick={onStopAllCommands}>
        Stop All
      </Button>
      <Button variant="primary" onClick={onClearLogs}>
        Clear All Logs
      </Button>
    </div>
  );
};

export default ActionButtons;
