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

// Main App Logic Component - FORENSIC DEBUGGING VERSION
const AppLogic: React.FC = () => {
  const { user, isLoading: userLoading, isInitialized } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('🔧 APP: Error fetching maintenance status:', error);
        return { maintenance_mode: false, allowed_roles: ['edufam_admin'] };
      }

      const maintenanceData = data?.setting_value as { enabled?: boolean; allowed_roles?: string[] } | null;
      return {
        maintenance_mode: maintenanceData?.enabled || false,
        allowed_roles: maintenanceData?.allowed_roles || ['edufam_admin']
      };
    },
    refetchInterval: 2000, // Check every 2 seconds for faster updates
    enabled: !userLoading && isInitialized && !!user // Wait for auth to be fully loaded
  });

  const isLoading = settingsLoading || userLoading || !isInitialized;

  // --- START OF FORENSIC LOGGING ---
  // This block will run every time the component re-renders.
  console.group('🔧 === MAINTENANCE MODE FORENSIC DIAGNOSTIC ===');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`🔄 Is the application currently loading data?`, isLoading);
  console.log(`👤 User loading state:`, userLoading);
  console.log(`🔐 Auth initialized state:`, isInitialized);
  console.log(`⚙️ Settings loading state:`, settingsLoading);
  
  if (!isLoading) {
    console.log('📊 Raw settings object from database query:', settings);
    console.log('👤 Raw user object from Auth context:', user);

    const isMaintenanceMode = settings?.maintenance_mode === true;
    const isAllowedRole = settings?.allowed_roles?.includes(user?.role || '') || false;
    
    console.log(`🔧 Does settings.maintenance_mode exist?`, settings?.maintenance_mode);
    console.log(`🔧 Type of settings.maintenance_mode:`, typeof settings?.maintenance_mode);
    console.log(`🔧 CALCULATED: Is Maintenance Mode ON?`, isMaintenanceMode);
    
    console.log(`👤 Does user.role exist?`, user?.role);
    console.log(`👤 Type of user.role:`, typeof user?.role);
    console.log(`👤 Allowed roles array:`, settings?.allowed_roles);
    console.log(`👤 CALCULATED: Is User in allowed roles?`, isAllowedRole);

    const shouldBlock = isMaintenanceMode && !isAllowedRole;
    console.log(`🚫 FINAL CHECK: Should block user? (isMaintenanceMode && !isAllowedRole)`, shouldBlock);
    
    if (shouldBlock) {
      console.log('🔴 RESULT: User will be blocked - showing MaintenancePage');
    } else {
      console.log('🟢 RESULT: User will be allowed - showing main application');
    }
  } else {
    console.log('⏳ Still loading... showing LoadingSpinner');
  }
  console.groupEnd();
  // --- END OF FORENSIC LOGGING ---

  // Render based on the state. This is the core logic.
  if (isLoading) {
    // Show a loading spinner while we check the status
    return <LoadingSpinner />;
  }

  const isMaintenanceMode = settings?.maintenance_mode === true;
  const isAllowedRole = settings?.allowed_roles?.includes(user?.role || '') || false;

  if (isMaintenanceMode && !isAllowedRole) {
    // If maintenance mode is ON and the user is NOT in allowed roles,
    // show ONLY the maintenance page.
    return <MaintenancePage />;
  }

  // If maintenance mode is OFF, OR if the user IS in allowed roles,
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
