import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { UIEnhancementProvider } from "@/contexts/UIEnhancementContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { GlobalErrorBoundary } from "@/components/common/GlobalErrorBoundary";
import AppRoutes from "@/components/AppRoutes";
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
  return <AppRoutes />;
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
  console.log("🚀 App component rendering");

  try {
    return (
      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider>
              <UIEnhancementProvider>
                <NavigationProvider>
                  <DashboardProvider>
                    <AppLogic />
                  </DashboardProvider>
                </NavigationProvider>
              </UIEnhancementProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    );
  } catch (error) {
    console.error("🚨 Error in App component:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Application Error
          </h1>
          <p className="text-gray-600 mb-4">
            Something went wrong initializing the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
