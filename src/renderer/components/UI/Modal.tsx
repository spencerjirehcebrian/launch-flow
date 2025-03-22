// src/renderer/components/UI/Modal.tsx
import React, { memo, useCallback } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = memo(
  ({ isOpen, onClose, title, children }) => {
    // Create a memoized close handler
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-secondary dark:bg-darkCard rounded-bubble shadow-bubble dark:shadow-bubble-dark p-6 w-full max-w-4xl relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-darkPrimary dark:to-darkSecondary">
            {title}
          </h2>
          {children}
        </div>
      </div>
    );
  }
);

// Add display name for debugging
Modal.displayName = "Modal";

export default Modal;
