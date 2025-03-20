import React from "react";
import { Flow, FLOWS } from "../../../types";

interface FlowSelectorProps {
  selectedFlows: Flow[];
  onUpdateFlows: (flows: Flow[]) => Promise<void>;
}

/**
 * Component for selecting deployment flows
 */
const FlowSelector: React.FC<FlowSelectorProps> = ({
  selectedFlows,
  onUpdateFlows,
}) => {
  // Handle checkbox change
  const handleFlowChange = (flow: Flow, checked: boolean) => {
    let updatedFlows: Flow[];

    if (checked) {
      // Add the flow if checked
      updatedFlows = [...selectedFlows, flow];
    } else {
      // Remove the flow if unchecked
      updatedFlows = selectedFlows.filter((f) => f !== flow);
    }

    onUpdateFlows(updatedFlows);
  };

  return (
    <div className="flow-selector">
      {Object.entries(FLOWS).map(([flowKey, flowConfig]) => {
        const flow = flowKey as Flow;
        return (
          <div className="checkbox-item" key={flow}>
            <input
              type="checkbox"
              id={`flow-${flow}`}
              className="flow-checkbox"
              data-flow={flow}
              checked={selectedFlows.includes(flow)}
              onChange={(e) => handleFlowChange(flow, e.target.checked)}
            />
            <label htmlFor={`flow-${flow}`}>{flowConfig.name}</label>
          </div>
        );
      })}
    </div>
  );
};

export default FlowSelector;
