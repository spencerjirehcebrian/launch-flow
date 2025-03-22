import React from "react";
import { Flow, FlowConfig } from "../../../types";
import ToggleButtonCheckbox from "../UI/ToggleButtonCheckbox"; // Import the new component

interface FlowSelectorProps {
  availableFlows: Record<Flow, FlowConfig>;
  selectedFlows: Flow[];
  onUpdateFlows: (flows: Flow[]) => Promise<void>;
}

const FlowSelector: React.FC<FlowSelectorProps> = ({
  availableFlows,
  selectedFlows,
  onUpdateFlows,
}) => {
  const handleFlowChange = (flow: Flow) => {
    const updatedFlows = selectedFlows.includes(flow)
      ? selectedFlows.filter((f) => f !== flow)
      : [...selectedFlows, flow];
    onUpdateFlows(updatedFlows);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {Object.entries(availableFlows).map(([flow, config]) => (
        <ToggleButtonCheckbox
          key={flow}
          id={`flow-${flow}`}
          label={config.name}
          checked={selectedFlows.includes(flow)}
          onChange={() => handleFlowChange(flow as Flow)}
        />
      ))}
    </div>
  );
};

export default FlowSelector;
