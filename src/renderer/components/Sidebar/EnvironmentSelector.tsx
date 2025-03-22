import React from "react";
import { Environment } from "../../../types";
import ToggleButtonCheckbox from "../UI/ToggleButtonCheckbox"; // Import the new component

interface EnvironmentSelectorProps {
  availableEnvironments: Environment[];
  selectedEnvironments: Environment[];
  onUpdateEnvironments: (environments: Environment[]) => Promise<void>;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  availableEnvironments,
  selectedEnvironments,
  onUpdateEnvironments,
}) => {
  const handleEnvironmentChange = (env: Environment) => {
    const updatedEnvironments = selectedEnvironments.includes(env)
      ? selectedEnvironments.filter((e) => e !== env)
      : [...selectedEnvironments, env];
    onUpdateEnvironments(updatedEnvironments);
  };

  const getBadgeColor = (env: Environment) => {
    switch (env) {
      case "dev":
        return "bg-blue-500 dark:bg-blue-600";
      case "qa":
        return "bg-amber-500 dark:bg-amber-600";
      case "stg":
        return "bg-purple-500 dark:bg-purple-600";
      case "prod":
        return "bg-red-500 dark:bg-red-600";
      default:
        return "bg-gray-500 dark:bg-gray-600";
    }
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
};

export default EnvironmentSelector;
