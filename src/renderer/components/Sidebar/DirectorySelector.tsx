// src/renderer/components/Sidebar/DirectorySelector.tsx
import React, { memo, useCallback } from "react";
import Button from "../UI/Buttons";
import { useNotificationStore } from "../../stores";

interface DirectorySelectorProps {
  directory: string;
  onSelectDirectory: () => Promise<string | null>;
}

/**
 * Component for selecting the root directory
 * Memoized to prevent unnecessary re-renders
 */
const DirectorySelector: React.FC<DirectorySelectorProps> = memo(
  ({ directory, onSelectDirectory }) => {
    const { addNotification } = useNotificationStore();

    const handleSelectDirectory = useCallback(async () => {
      try {
        const newPath = await onSelectDirectory();
        if (newPath) {
          addNotification(`Root directory updated to: ${newPath}`, "success");
        }
      } catch (error: any) {
        addNotification(`Error selecting directory: ${error.message}`, "error");
      }
    }, [onSelectDirectory, addNotification]);

    return (
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-3 bg-secondary dark:bg-darkAccent border border-pink-200 dark:border-darkAccent rounded-bubble text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-darkPrimary dark:focus:border-darkPrimary outline-none transition-all duration-300"
          value={directory}
          placeholder="Select a directory..."
          readOnly
        />
        <Button variant="primary" onClick={handleSelectDirectory}>
          Browse
        </Button>
      </div>
    );
  }
);

// Add display name for debugging
DirectorySelector.displayName = "DirectorySelector";

export default DirectorySelector;
