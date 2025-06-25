
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MaintenanceCheck from "./components/maintenance/MaintenanceCheck";
import Index from "./pages/Index";
import { HttpsEnforcer } from "./utils/httpsEnforcer";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize security measures on app start
    HttpsEnforcer.initializeSecurity();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MaintenanceCheck>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/*" element={<Index />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MaintenanceCheck>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
