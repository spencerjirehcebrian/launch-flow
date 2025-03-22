import React, { memo } from "react"; // Add memo import
import { Flow, FlowConfig } from "../../../types";
import ToggleButtonCheckbox from "../UI/ToggleButtonCheckbox";

interface FlowSelectorProps {
  availableFlows: Record<Flow, FlowConfig>;
  selectedFlows: Flow[];
  onUpdateFlows: (flows: Flow[]) => Promise<void>;
}

// Use memo to prevent unnecessary re-renders
const FlowSelector: React.FC<FlowSelectorProps> = memo(
  ({ availableFlows, selectedFlows, onUpdateFlows }) => {
    const handleFlowChange = (flow: Flow) => {
      const updatedFlows = selectedFlows.includes(flow)
        ? selectedFlows.filter((f) => f !== flow)
        : [...selectedFlows, flow];

      // Call the update function silently (no notifications)
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
  }
);

// Add display name for debugging
FlowSelector.displayName = "FlowSelector";

export default FlowSelector;
