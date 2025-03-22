// src/renderer/components/Sidebar/Sidebar.tsx
import React, { useState } from "react";
import { Environment, Flow, FlowConfig, Project } from "../../../types";
import DirectorySelector from "./DirectorySelector";
import EnvironmentSelector from "./EnvironmentSelector";
import FlowSelector from "./FlowSelector";
import ActionButtons from "./ActionButtons";
import ThemeToggle from "./ThemeToggle";
import ProjectModal from "./ProjectModal";

interface SidebarProps {
  projects: Project[];
  selectedProject: string | null;
  selectedEnvironments: Environment[];
  selectedFlows: Flow[];
  onSelectProject: (projectName: string) => Promise<void>;
  onSelectDirectory: (projectName: string) => Promise<string | null>;
  onUpdateEnvironments: (environments: Environment[]) => Promise<void>;
  onUpdateFlows: (flows: Flow[]) => Promise<void>;
  onRunFlows: () => Promise<void>;
  onStopAllCommands: () => Promise<boolean>;
  onClearLogs: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProject,
  selectedEnvironments,
  selectedFlows,
  onSelectProject,
  onSelectDirectory,
  onUpdateEnvironments,
  onUpdateFlows,
  onRunFlows,
  onStopAllCommands,
  onClearLogs,
}) => {
  const currentProject = projects.find((p) => p.name === selectedProject);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleOpenProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleSelectDirectory = async () => {
    if (!currentProject || !selectedProject) {
      console.error("No project selected");
      return null;
    }

    try {
      const newPath = await onSelectDirectory(selectedProject);
      if (newPath) {
        console.log(
          `Directory for project ${selectedProject} updated to: ${newPath}`
        );
      }
      return newPath;
    } catch (error) {
      console.error("Error selecting directory:", error);
      return null;
    }
  };

  return (
    <div className="w-[350px] min-w-[300px] bg-secondary dark:bg-darkCard rounded-bubble border border-pink-100 dark:border-darkAccent shadow-bubble dark:shadow-bubble-dark m-4 p-6 flex flex-col overflow-y-auto h-[calc(100%-2rem)] flex-shrink-0 transition-all duration-300 animate-slideInLeft">
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
        onSelectProject={onSelectProject}
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
              onUpdateEnvironments={onUpdateEnvironments}
            />
          </div>

          <div className="mb-6">
            <h3 className="mb-2 text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
              Flows
            </h3>
            <FlowSelector
              availableFlows={currentProject.flows}
              selectedFlows={selectedFlows}
              onUpdateFlows={onUpdateFlows}
            />
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <ActionButtons
                onRunFlows={onRunFlows}
                onStopAllCommands={onStopAllCommands}
                onClearLogs={onClearLogs}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
