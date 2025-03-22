import React from "react";

interface ToggleButtonCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * A toggle button that behaves like a checkbox. Visually styled as a button with centered text.
 */
const ToggleButtonCheckbox: React.FC<ToggleButtonCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div
      className={`flex items-center justify-center p-3 rounded-bubble cursor-pointer transition-all duration-300 
        ${
          checked
            ? "bg-gradient-pink-bubble shadow-sm text-secondary dark:text-gray-100 border border-pink-200 dark:border-darkAccent"
            : "bg-transparent hover:bg-pink-50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300 border border-pink-200 dark:border-darkAccent"
        } `}
      onClick={() => onChange(!checked)} // Toggle the checked state on click
    >
      <label
        htmlFor={id}
        className="text-sm cursor-pointer select-none" // Prevents text selection on click
      >
        {label}
      </label>
    </div>
  );
};

export default ToggleButtonCheckbox;
