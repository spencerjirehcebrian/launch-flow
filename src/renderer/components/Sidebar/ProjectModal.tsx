// src/renderer/components/Sidebar/ProjectModal.tsx
import React, { memo, useCallback } from "react";
import { Project } from "../../../types";
import Modal from "../UI/Modal";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProject: string | null;
  onSelectProject: (projectName: string) => Promise<void>;
}

const ProjectModal: React.FC<ProjectModalProps> = memo(
  ({ isOpen, onClose, projects, selectedProject, onSelectProject }) => {
    const handleProjectSelect = useCallback(
      async (projectName: string) => {
        await onSelectProject(projectName);
        onClose(); // Close the modal after selecting a project
      },
      [onSelectProject, onClose]
    );

    if (!isOpen) return null;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Select Project">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className={`p-4 rounded-bubble border border-pink-200 dark:border-darkAccent shadow-sm cursor-pointer transition-colors duration-200 text-lg ${
                selectedProject === project.name
                  ? "bg-gradient-pink-bubble text-secondary dark:text-gray-100"
                  : "hover:bg-pink-50 dark:hover:bg-darkAccent/20 bg-secondary dark:bg-darkCard"
              }`}
              onClick={() => handleProjectSelect(project.name)}
            >
              <h4 className="font-medium">{project.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Path: {project.path}
              </p>
            </div>
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No projects available.
          </p>
        )}
      </Modal>
    );
  }
);

// Add display name for debugging
ProjectModal.displayName = "ProjectModal";

export default ProjectModal;
