
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MaintenanceCheck from "./components/maintenance/MaintenanceCheck";
import Index from "./pages/Index";
import { HttpsEnforcer } from "./utils/httpsEnforcer";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./components/Dashboard";
import SchoolAnalyticsOverview from "./components/analytics/SchoolAnalyticsOverview";
import SystemSettings from "./components/settings/SystemSettings";

const queryClient = new QueryClient();

const App = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  useEffect(() => {
    // Initialize security measures on app start
    HttpsEnforcer.initializeSecurity();
  }, []);

  // Function to render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'schools-analytics':
        return <SchoolAnalyticsOverview />;
      case 'system-settings':
      case 'maintenance':
      case 'database':
      case 'security':
      case 'notifications':
      case 'user-management':
      case 'company-settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

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
