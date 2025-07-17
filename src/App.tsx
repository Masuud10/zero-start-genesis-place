import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider } from "@/components/auth/AdminAuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import AppContent from "@/components/AppContent";
import AdminLandingPage from "@/pages/AdminLandingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - increased for better performance
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        // Don't retry auth errors or validation errors
        if (
          error instanceof Error &&
          (error.message?.includes("auth") ||
            error.message?.includes("unauthorized") ||
            error.message?.includes("validation") ||
            error.message?.includes("permission"))
        ) {
          return false;
        }
        return failureCount < 1; // Reduced retries for better performance
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Reduced max delay
      refetchOnWindowFocus: false, // Disabled to reduce unnecessary requests
      refetchOnMount: false, // Disabled to reduce unnecessary requests
      refetchOnReconnect: false, // Disabled to reduce unnecessary requests
      refetchInterval: false, // Disabled by default, enable per query if needed
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
      {/* Public Admin Landing Page */}
      <Route path="/" element={<AdminLandingPage />} />
      
      {/* All admin routes are protected */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// Main App Logic Component
const AppLogic: React.FC = () => {
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
          <AdminAuthProvider>
            <ThemeProvider>
              <AppLogic />
            </ThemeProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
