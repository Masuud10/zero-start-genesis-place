import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const AppGate = () => {
  console.log("🚀 AppGate: Starting application");
  return <App />;
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

console.log("🚀 Application starting...");

const root = ReactDOM.createRoot(rootElement);
root.render(<AppGate />);
