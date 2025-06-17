
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SchoolProvider } from '@/contexts/SchoolContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ErrorBoundary } from '@/utils/errorBoundary';
import AppContent from '@/components/AppContent';

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry auth or permission errors
        if (error?.message?.includes('Authentication') || error?.message?.includes('Access denied')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Disable refetch on window focus to reduce API calls
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  console.log('🚀 App: Starting application');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SchoolProvider>
              <NavigationProvider>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/*" element={<AppContent />} />
                  </Routes>
                  <Toaster />
                </div>
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
              </NavigationProvider>
            </SchoolProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
