import React from "react";
import { Environment, Flow } from "../../../types";
import DirectorySelector from "./DirectorySelector";
import EnvironmentSelector from "./EnvironmentSelector";
import FlowSelector from "./FlowSelector";
import ActionButtons from "./ActionButtons";

interface SidebarProps {
  rootDirectory: string;
  selectedEnvironments: Environment[];
  selectedFlows: Flow[];
  onSelectDirectory: () => Promise<string | null>;
  onUpdateEnvironments: (environments: Environment[]) => Promise<void>;
  onUpdateFlows: (flows: Flow[]) => Promise<void>;
  onRunFlows: () => Promise<void>;
  onStopAllCommands: () => Promise<boolean>;
}

/**
 * Sidebar component containing configuration options and action buttons
 */
const Sidebar: React.FC<SidebarProps> = ({
  rootDirectory,
  selectedEnvironments,
  selectedFlows,
  onSelectDirectory,
  onUpdateEnvironments,
  onUpdateFlows,
  onRunFlows,
  onStopAllCommands,
}) => {
  return (
    <div className="sidebar">
      <div className="section">
        <h3>Root Directory</h3>
        <DirectorySelector
          directory={rootDirectory}
          onSelectDirectory={onSelectDirectory}
        />
      </div>

      <div className="section">
        <h3>Environments</h3>
        <EnvironmentSelector
          selectedEnvironments={selectedEnvironments}
          onUpdateEnvironments={onUpdateEnvironments}
        />
      </div>

      <div className="section">
        <h3>Flows</h3>
        <FlowSelector
          selectedFlows={selectedFlows}
          onUpdateFlows={onUpdateFlows}
        />
      </div>

      <div className="actions">
        <ActionButtons
          onRunFlows={onRunFlows}
          onStopAllCommands={onStopAllCommands}
        />
      </div>
    </div>
  );
};

export default Sidebar;
