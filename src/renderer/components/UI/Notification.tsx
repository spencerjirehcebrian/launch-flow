// src/renderer/components/UI/Notification.tsx
import React, { useState, useEffect } from "react";

export type NotificationVariant = "info" | "error" | "warning" | "success";

interface NotificationProps {
  id: string; // Unique ID for each notification
  message: string;
  variant: NotificationVariant;
  onClose: (id: string) => void; // Pass the ID to onClose
  autoClose?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  variant,
  onClose,
  autoClose = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false); // Start fade-out
        setTimeout(() => {
          onClose(id); // Remove after animation
        }, 300); // Match animation duration
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose, id]);

  const handleCloseClick = () => {
    setIsVisible(false); // Start fade-out
    setTimeout(() => {
      onClose(id); // Remove after animation
    }, 300); // Match animation duration
  };

  let bgColorClass = "bg-gray-500";
  let textColorClass = "text-white";
  let icon: JSX.Element = <></>;

  switch (variant) {
    case "info":
      bgColorClass = "bg-blue-500";
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
      break;
    case "error":
      bgColorClass = "bg-red-500";
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
      break;
    case "warning":
      bgColorClass = "bg-yellow-500";
      textColorClass = "text-gray-800";
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c-7.654 0-9.406 5.779-9.504 8.902 0 .035.002.07.004.105a.84.84 0 00.07 0c.003.002.006.004.009.006.022.015.048.027.077.038.486.197 1.057.381 1.665.561l1.918 1.73a.5.5 0 01-.499.901H7.885a.5.5 0 01-.5-.5v-1.172a.5.5 0 01.5-.5H8.5a.5.5 0 01.5.5v.418c0 .382.095.745.263 1.083.261.512.734.884 1.267.987l.389.074c.148.028.3.042.455.042a6.265 6.265 0 003.076-.485c.222-.062.439-.15.639-.262l.219-.124-.003.002a.859.859 0 010-.138l-.014-.082-.006-.013c-.02-.03-.04-.06-.061-.09-.027-.035-.058-.065-.09-.092-.055-.058-.128-.113-.21-.164-.168-.105-.366-.196-.59-.275l-.484-.166-.013-.004c-.058-.017-.118-.031-.179-.041a7.52 7.52 0 00-3.655.655v-.236a.5.5 0 01.5-.5H13a.5.5 0 01.5.5v.653l.224.079c.271.097.525.222.75.371.109.071.21.148.305.23a.832.832 0 01.016-.036.84.84 0 00.115-.026c0-.004.009-.021.023-.04.039-.056.084-.108.133-.153l.064-.057a.821.821 0 00.057-.046.814.814 0 01.004-.017l-.004-.006c-.002-.002-.004-.004-.006-.006-.016-.013-.032-.027-.049-.04a.826.826 0 01-.003-.002zm3.911 5.82c0 .057-.011.113-.032.162l-.024.05-.006.006c-.026.04-.068.071-.113.094-.074.038-.161.073-.251.105-.215.074-.453.142-.701.204a.5.5 0 01-.215-.753c.261-.062.502-.126.721-.193.099-.03.193-.065.281-.103.182-.077.351-.174.501-.28.055-.04.109-.081.16-.122l.015-.012-.004.002zm-1.685-1.075c.402 0 .725-.323.725-.725s-.323-.725-.725-.725-.725.323-.725.725.323.725.725.725zm2.288 4.499c-.005-.008-.011-.016-.017-.025l-.045-.066-.007-.011c-.156-.233-.526-.613-.727-.829a.5.5 0 00-.656.093c.21.224.592.617.75.809.025.031.05.061.075.09l.024.028-.006.004z"
            clipRule="evenodd"
          />
        </svg>
      );
      break;
    case "success":
      bgColorClass = "bg-green-500";
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
      break;
    default:
      break;
  }

  return (
    <div
      className={`flex ${
        isVisible ? "opacity-100 animate-slideIn" : "fading"
      } items-start ${bgColorClass} ${textColorClass} py-2 px-4 rounded-md shadow-md mb-2 transition-opacity duration-300`}
    >
      {icon}
      <span
        className="flex-1 break-words whitespace-pre-wrap"
        style={{ wordBreak: "break-word" }}
      >
        {message}
      </span>
      <button
        className="ml-auto bg-transparent border-none text-white text-lg cursor-pointer"
        onClick={handleCloseClick}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
