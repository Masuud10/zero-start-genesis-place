import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { useMaintenanceGate } from "./hooks/useMaintenanceGate";
import MaintenancePage from "./components/maintenance/MaintenancePage";
import { Loader2 } from "lucide-react";
import "./index.css";

const AppGate = () => {
  const { isLoading, isBlocked, refreshStatus } = useMaintenanceGate();

  // Add timeout to prevent infinite loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⚠️ MaintenanceGate timeout - forcing app to load');
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  // If loading for more than 5 seconds, bypass maintenance check
  const [forceLoad, setForceLoad] = React.useState(false);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ MaintenanceGate timeout - bypassing check');
        setForceLoad(true);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading && !forceLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-sm text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (isBlocked && !forceLoad) {
    return <MaintenancePage />;
  }

  return <App />;
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

console.log("🚀 Application starting...");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppGate />
  </React.StrictMode>
);
