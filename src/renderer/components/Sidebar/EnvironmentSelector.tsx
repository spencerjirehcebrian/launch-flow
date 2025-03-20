import React from "react";
import { Environment } from "../../../types";

interface EnvironmentSelectorProps {
  selectedEnvironments: Environment[];
  onUpdateEnvironments: (environments: Environment[]) => Promise<void>;
}

/**
 * Component for selecting deployment environments
 */
const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  selectedEnvironments,
  onUpdateEnvironments,
}) => {
  // List of all available environments
  const availableEnvironments: Environment[] = ["dev", "qa", "stg", "prod"];

  // Handle checkbox change
  const handleEnvironmentChange = (env: Environment, checked: boolean) => {
    let updatedEnvironments: Environment[];

    if (checked) {
      // Add the environment if checked
      updatedEnvironments = [...selectedEnvironments, env];
    } else {
      // Remove the environment if unchecked
      updatedEnvironments = selectedEnvironments.filter((e) => e !== env);
    }

    onUpdateEnvironments(updatedEnvironments);
  };

  return (
    <div className="environment-selector">
      {availableEnvironments.map((env) => (
        <div className="checkbox-item" key={env}>
          <input
            type="checkbox"
            id={`env-${env}`}
            className="env-checkbox"
            data-env={env}
            checked={selectedEnvironments.includes(env)}
            onChange={(e) => handleEnvironmentChange(env, e.target.checked)}
          />
          <label htmlFor={`env-${env}`}>{env.toUpperCase()}</label>
        </div>
      ))}
    </div>
  );
};

export default EnvironmentSelector;
