
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import MaintenanceGate from "./components/auth/MaintenanceGate";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

console.log('🚀 Application starting...');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* The MaintenanceGate now wraps the ENTIRE App component */}
    <MaintenanceGate>
      <App />
    </MaintenanceGate>
  </React.StrictMode>
);
