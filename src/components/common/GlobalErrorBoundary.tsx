import React from "react";
import { ErrorBoundary } from "@/utils/errorBoundaryUtils";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
