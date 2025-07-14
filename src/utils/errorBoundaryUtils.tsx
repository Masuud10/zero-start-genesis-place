/**
 * Error Boundary Utilities
 * This module provides comprehensive error handling to prevent frontend crashes
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  errorReporting?: boolean;
}

/**
 * Enhanced Error Boundary Component
 * FIXED: Provides comprehensive error handling and recovery
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Report error if enabled
    if (this.props.errorReporting) {
      this.reportError(error, errorInfo);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when props change (if enabled)
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      JSON.stringify(prevProps.children) !== JSON.stringify(this.props.children)
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send error to monitoring service (if configured)
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Log to console for development
      if (process.env.NODE_ENV === "development") {
        console.group("🚨 Error Report");
        console.log("Error ID:", errorReport.errorId);
        console.log("Error:", errorReport);
        console.groupEnd();
      }

      // TODO: Send to error monitoring service (e.g., Sentry, LogRocket)
      // errorMonitoringService.captureException(error, errorReport);
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReset = () => {
    // Force reload the page as a last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error!, this.state.errorInfo!);
        }
        return this.props.fallback;
      }

      return this.renderDefaultErrorUI();
    }

    return this.props.children;
  }

  private renderDefaultErrorUI() {
    return (
      <div className="error-boundary-fallback min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              We're sorry, but something unexpected happened. Our team has been
              notified.
            </p>

            {this.state.errorId && (
              <p className="mt-1 text-xs text-gray-400">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={this.handleRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Show Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Generate unique error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook to handle async errors in components
 * FIXED: Provides error handling for async operations
 */
export function useAsyncError() {
  const [, setError] = React.useState();
  return React.useCallback((e: Error) => {
    setError(() => {
      throw e;
    });
  }, []);
}

/**
 * Hook to handle errors in event handlers
 * FIXED: Provides error handling for event handlers
 */
export function useErrorHandler() {
  const throwError = useAsyncError();

  return React.useCallback(
    (error: unknown, context?: string) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const fullError = new Error(
        context ? `${context}: ${errorMessage}` : errorMessage
      );

      console.error("🚨 Error in event handler:", fullError);
      throwError(fullError);
    },
    [throwError]
  );
}

/**
 * Utility to wrap async functions with error handling
 * FIXED: Ensures async functions don't crash the app
 */
export function withErrorHandling<
  T extends (...args: unknown[]) => Promise<unknown>
>(fn: T, context?: string): T {
  return ((...args: unknown[]) => {
    return fn(...args).catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const fullError = new Error(
        context ? `${context}: ${errorMessage}` : errorMessage
      );

      console.error("🚨 Async function error:", fullError);

      // Re-throw to be caught by error boundary
      throw fullError;
    });
  }) as T;
}

/**
 * Utility to handle errors in useEffect
 * FIXED: Provides error handling for useEffect hooks
 */
export function useErrorEffect(
  effect: () => void | (() => void),
  dependencies: React.DependencyList = []
) {
  const throwError = useAsyncError();

  React.useEffect(() => {
    try {
      return effect();
    } catch (error) {
      console.error("🚨 Error in useEffect:", error);
      throwError(error instanceof Error ? error : new Error(String(error)));
    }
  }, dependencies);
}

/**
 * Higher-order component to wrap components with error handling
 * FIXED: Provides error boundary wrapper for components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Global error handler for unhandled promise rejections
 * FIXED: Catches unhandled promise rejections
 */
export function setupGlobalErrorHandling() {
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      console.error("🚨 Unhandled promise rejection:", event.reason);

      // Prevent the default browser behavior
      event.preventDefault();

      // You can add custom handling here (e.g., show toast, log to service)
    });

    window.addEventListener("error", (event) => {
      console.error("🚨 Global error:", event.error);

      // You can add custom handling here
    });
  }
}
