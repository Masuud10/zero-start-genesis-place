import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppContent from "@/components/AppContent";
import ResetPasswordPage from "@/components/ResetPasswordPage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import CertificateVerification from "@/pages/CertificateVerification";
import MaintenancePage from "@/pages/MaintenancePage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import "./App.css";
import "./utils/maintenanceDebugConsole";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry auth errors
        if (
          error instanceof Error &&
          (error.message?.includes("auth") ||
            error.message?.includes("unauthorized"))
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: "always",
    },
    mutations: {
      retry: false, // Don't retry mutations to prevent data inconsistency
    },
  },
});

// Core App Router Component
const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />
      <Route
        path="/verify-certificate/:certificateId"
        element={<CertificateVerification />}
      />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
};

// Main App Logic with Global Maintenance Check
const AppLogic: React.FC = () => {
  // 1. Get the system settings and user data
  const { user, isLoading: userLoading, isInitialized } = useAuth();

  const { data: maintenanceStatus, isLoading: settingsLoading } = useQuery({
    queryKey: ['maintenance-global-check'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('🔧 APP: Error fetching maintenance status:', error);
        return { enabled: false, message: '' };
      }

      const maintenanceData = data?.setting_value as { enabled?: boolean; message?: string } | null;
      return {
        enabled: maintenanceData?.enabled || false,
        message: maintenanceData?.message || ''
      };
    },
    refetchInterval: 2000, // Check every 2 seconds for faster updates
    enabled: !userLoading && isInitialized && !!user // Wait for auth to be fully loaded
  });

  // 2. Determine the application's state
  const isMaintenanceMode = maintenanceStatus?.enabled === true;
  const isEduFamAdmin = user?.role === 'edufam_admin';
  const isLoading = settingsLoading || userLoading || !isInitialized;

  console.log('🔧 APP GLOBAL CHECK:', {
    isMaintenanceMode,
    userRole: user?.role,
    isEduFamAdmin,
    isLoading,
    shouldShowMaintenance: isMaintenanceMode && !isEduFamAdmin
  });

  // 3. Render based on the state. This is the core logic.
  if (isLoading) {
    // Show a loading spinner while we check the status
    return <LoadingSpinner />;
  }

  if (isMaintenanceMode && !isEduFamAdmin) {
    // If maintenance mode is ON and the user is NOT an admin,
    // show ONLY the maintenance page.
    return <MaintenancePage />;
  }

  // If maintenance mode is OFF, OR if the user IS an admin,
  // render the rest of the application.
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <SchoolProvider>
                <NavigationProvider>
                  <AppLogic />
                </NavigationProvider>
              </SchoolProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
