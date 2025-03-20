import React from "react";

interface DirectorySelectorProps {
  directory: string;
  onSelectDirectory: () => Promise<string | null>;
}

/**
 * Component for selecting the root directory
 */
const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  directory,
  onSelectDirectory,
}) => {
  return (
    <div className="directory-selector">
      <input
        type="text"
        className="form-control"
        value={directory}
        placeholder="Select a directory..."
        readOnly
      />
      <button className="action-btn" onClick={onSelectDirectory}>
        Browse
      </button>
    </div>
  );
};

export default DirectorySelector;
