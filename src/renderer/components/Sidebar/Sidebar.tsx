// src/renderer/components/Sidebar/Sidebar.tsx
import React, { useState, memo, useCallback } from "react";
import DirectorySelector from "./DirectorySelector";
import EnvironmentSelector from "./EnvironmentSelector";
import FlowSelector from "./FlowSelector";
import ActionButtons from "./ActionButtons";
import ThemeToggle from "./ThemeToggle";
import ProjectModal from "./ProjectModal";
import { useConfigStore, useCommandStore } from "../../stores";

/**
 * Main sidebar component - now connected directly to stores
 * and optimized to prevent unnecessary re-renders
 */
const Sidebar: React.FC = memo(() => {
  // Use selective subscriptions to prevent whole component re-renders
  const projects = useConfigStore((state) => state.config.projects);
  const selectedProject = useConfigStore(
    (state) => state.config.selectedProject
  );
  const selectedEnvironments = useConfigStore(
    (state) => state.config.selectedEnvironments
  );
  const selectedFlows = useConfigStore((state) => state.config.selectedFlows);

  // Get actions but don't subscribe to their changes
  const {
    selectRootDirectory,
    updateSelectedEnvironments,
    updateSelectedFlows,
    selectProject,
  } = useConfigStore();

  const { runSelectedFlows, stopAllCommands, clearCommandResults } =
    useCommandStore();

  const currentProject = projects.find((p) => p.name === selectedProject);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Memoize handlers to prevent recreation on each render
  const handleOpenProjectModal = useCallback(() => {
    setIsProjectModalOpen(true);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
  }, []);

  const handleSelectDirectory = useCallback(async () => {
    if (!currentProject || !selectedProject) {
      console.error("No project selected");
      return null;
    }

    try {
      const newPath = await selectRootDirectory(selectedProject);
      return newPath;
    } catch (error) {
      console.error("Error selecting directory:", error);
      return null;
    }
  }, [currentProject, selectedProject, selectRootDirectory]);

  const handleSelectProject = useCallback(
    async (projectName: string) => {
      await selectProject(projectName);
      handleCloseProjectModal();
    },
    [selectProject, handleCloseProjectModal]
  );

  const handleRunFlows = useCallback(async () => {
    if (!currentProject) return;

    await runSelectedFlows(
      selectedFlows,
      selectedEnvironments,
      currentProject.path
    );
  }, [currentProject, selectedEnvironments, selectedFlows, runSelectedFlows]);

  // If there's no project data yet, render minimal content
  if (projects.length === 0) {
    return (
      <div className="w-[350px] min-w-[300px] bg-secondary dark:bg-darkCard rounded-bubble border border-pink-100 dark:border-darkAccent shadow-bubble dark:shadow-bubble-dark m-4 p-6 flex flex-col overflow-y-auto h-[calc(100%-2rem)] flex-shrink-0 transition-all duration-300 animate-slideInLeft">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
            Projects
          </h3>
          <ThemeToggle />
        </div>
        <div className="text-center p-8 text-gray-400">
          <h3 className="mb-4 text-gray-800 dark:text-gray-100 font-medium">
            No Projects Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please configure projects in your deployment-config.json file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[350px] min-w-[300px] bg-secondary dark:bg-darkCard rounded-bubble border border-pink-100 dark:border-darkAccent shadow-bubble dark:shadow-bubble-dark m-4 p-6 flex flex-col overflow-y-auto h-[calc(100%-2rem)] flex-shrink-0 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
          Projects
        </h3>
        <ThemeToggle />
      </div>

      <button
        onClick={handleOpenProjectModal}
        className="w-full p-3 bg-secondary dark:bg-darkAccent border border-pink-200 dark:border-darkAccent rounded-bubble text-sm focus:ring-2 focus:ring-primary focus:border-primary dark:focus:ring-darkPrimary dark:focus:border-darkPrimary outline-none mb-6 transition-all duration-300 text-left"
      >
        {selectedProject
          ? `Selected Project: ${selectedProject}`
          : "Select a project"}
      </button>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
      />

      {currentProject && (
        <>
          <div className="mb-6">
            <h3 className="mb-2 text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
              Root Directory
            </h3>
            <DirectorySelector
              directory={currentProject.path}
              onSelectDirectory={handleSelectDirectory}
            />
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
              Environments
            </h3>
            <EnvironmentSelector
              availableEnvironments={currentProject.environments}
              selectedEnvironments={selectedEnvironments}
              onUpdateEnvironments={updateSelectedEnvironments}
            />
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
              Flows
            </h3>
            <FlowSelector
              availableFlows={currentProject.flows}
              selectedFlows={selectedFlows}
              onUpdateFlows={updateSelectedFlows}
            />
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <ActionButtons onRunFlows={handleRunFlows} />
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Add display name for debugging
Sidebar.displayName = "Sidebar";

export default Sidebar;
