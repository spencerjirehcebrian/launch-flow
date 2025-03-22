import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "info"
  | "inline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  ...props
}) => {
  let baseClasses =
    "py-3 px-4 font-medium rounded-bubble shadow-bubble transition-all duration-200 relative overflow-hidden"; // Relative positioning and overflow hidden for effects
  let variantClasses = "";
  let hoverClasses = "";
  let activeClasses = "";

  switch (variant) {
    case "primary":
      variantClasses = "bg-gradient-pink-bubble text-white w-full";
      hoverClasses =
        "shadow-bubble-hover dark:shadow-bubble-dark dark:hover:shadow-bubble-hover-dark";
      activeClasses = "transform translate-y-0.5 shadow-inner"; // Subtle push-down effect on click
      break;
    case "secondary":
      variantClasses =
        "bg-gradient-secondary text-gray-800 dark:text-gray-100 w-full";
      hoverClasses = "shadow-md";
      activeClasses = "transform translate-y-0.5 shadow-inner";
      break;
    case "danger":
      variantClasses =
        "bg-gradient-pink-bubble hover:from-red-500 hover:to-red-700 text-white shadow-md w-full";
      hoverClasses = "shadow-lg";
      activeClasses = "transform translate-y-0.5 shadow-inner";
      break;
    case "success":
      variantClasses = "bg-green-500 text-white shadow-md w-full";
      hoverClasses = "hover:bg-green-700";
      activeClasses = "transform translate-y-0.5 shadow-inner";
      break;
    case "warning":
      variantClasses = "bg-yellow-500 text-gray-800 w-full";
      hoverClasses = "hover:bg-yellow-700";
      activeClasses = "transform translate-y-0.5 shadow-inner";
      break;
    case "info":
      variantClasses = "bg-blue-500 text-white w-full";
      hoverClasses = "hover:bg-blue-700";
      activeClasses = "transform translate-y-0.5 shadow-inner";
      break;
    case "inline":
      variantClasses = "bg-gradient-secondary dark:bg-gradient-secondary-dark";
      break;
    default:
      variantClasses = "bg-gray-300 text-gray-800 w-full";
      hoverClasses = "hover:bg-gray-400";
      activeClasses = "transform translate-y-0.5 shadow-inner";
  }

  const combinedClasses = `${baseClasses} ${variantClasses} hover:${hoverClasses} active:${activeClasses}`;

  return (
    <button {...props} className={combinedClasses}>
      {children}
    </button>
  );
};

export default Button;
