import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import MaintenanceGuard from "@/components/guards/MaintenanceGuard";
import AppContent from "@/components/AppContent";
import ResetPasswordPage from "@/components/ResetPasswordPage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import CertificateVerification from "@/pages/CertificateVerification";
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

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <SchoolProvider>
                <NavigationProvider>
                  <MaintenanceGuard>
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
                  </MaintenanceGuard>
                  <Toaster />
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
