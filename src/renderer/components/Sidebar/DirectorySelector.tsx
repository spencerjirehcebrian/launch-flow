import React from "react";
import Button from "../UI/Buttons";

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
    <div className="flex gap-2 animate-fadeIn">
      <input
        type="text"
        className="flex-1 p-3 bg-secondary dark:bg-darkAccent border border-pink-200 dark:border-darkAccent rounded-bubble text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-darkPrimary dark:focus:border-darkPrimary outline-none transition-all duration-300"
        value={directory}
        placeholder="Select a directory..."
        readOnly
      />
      <Button variant="primary" onClick={onSelectDirectory}>
        Browse
      </Button>
    </div>
  );
};

export default DirectorySelector;
