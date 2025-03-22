// src/renderer/components/Header.tsx
import React from "react";

const Header: React.FC = () => {
  return (
    <header
      className="bg-gradient-primary dark:bg-gradient-primary-dark text-white p-4 text-center shadow-bubble dark:shadow-bubble-dark rounded-b-bubble animate-slideInDown"
    >
      <h1 className="text-2xl font-medium m-0">Deployment App</h1>
    </header>
  );
};

export default Header;