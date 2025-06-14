
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import AppContent from "@/components/AppContent";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('🚀 App: Starting application');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SchoolProvider>
              <AppContent />
              <Toaster />
            </SchoolProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
