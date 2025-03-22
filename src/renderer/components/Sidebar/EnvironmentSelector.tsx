// src/renderer/components/Sidebar/EnvironmentSelector.tsx
import React, { memo } from "react"; // Add memo import
import { Environment } from "../../../types";
import ToggleButtonCheckbox from "../UI/ToggleButtonCheckbox";

interface EnvironmentSelectorProps {
  availableEnvironments: Environment[];
  selectedEnvironments: Environment[];
  onUpdateEnvironments: (environments: Environment[]) => Promise<void>;
}

// Use memo to prevent unnecessary re-renders
const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = memo(
  ({ availableEnvironments, selectedEnvironments, onUpdateEnvironments }) => {
    const handleEnvironmentChange = (env: Environment) => {
      const updatedEnvironments = selectedEnvironments.includes(env)
        ? selectedEnvironments.filter((e) => e !== env)
        : [...selectedEnvironments, env];

      // Call the update function silently (no notifications)
      onUpdateEnvironments(updatedEnvironments);
    };

    return (
      <div className="grid grid-cols-2 gap-3">
        {availableEnvironments.map((env) => (
          <ToggleButtonCheckbox
            key={env}
            id={`env-${env}`}
            label={env.toUpperCase()}
            checked={selectedEnvironments.includes(env)}
            onChange={() => handleEnvironmentChange(env)}
          />
        ))}
      </div>
    );
  }
);

// Add display name for debugging
EnvironmentSelector.displayName = "EnvironmentSelector";

export default EnvironmentSelector;
