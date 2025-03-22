import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css";
import App from "./components/App";
// Find the root element
const container = document.getElementById("root");

// Ensure the container exists
if (!container) {
  throw new Error(
    'Root element not found! Add <div id="root"></div> to your HTML'
  );
}

// Create a root
const root = createRoot(container);

// Render the app using JSX syntax
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("React renderer process loaded");
