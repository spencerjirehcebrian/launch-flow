import React from "react";
import Button from "../UI/Buttons";
import { useCommandStore, useNotificationStore } from "../../stores";

/**
 * Component for action buttons (run, stop, clear logs)
 * Now directly connected to stores
 */
const ActionButtons: React.FC<{
  onRunFlows: () => Promise<void>;
}> = ({ onRunFlows }) => {
  const { stopAllCommands, clearCommandResults } = useCommandStore();
  const { addNotification } = useNotificationStore();

  const handleClearLogs = () => {
    clearCommandResults();
    addNotification("Command logs cleared", "info");
  };

  return (
    <div className="flex flex-col gap-3">
      <Button variant="primary" onClick={onRunFlows}>
        Run Selected Flows
      </Button>
      <Button variant="danger" onClick={stopAllCommands}>
        Stop All
      </Button>
      <Button variant="primary" onClick={handleClearLogs}>
        Clear All Logs
      </Button>
    </div>
  );
};

export default ActionButtons;
