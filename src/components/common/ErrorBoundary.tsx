import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // This would typically send to a service like Sentry, LogRocket, etc.
      console.error("📊 Error logged to service:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    } catch (logError) {
      console.error("Failed to log error to service:", logError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-600">
                  Something went wrong
                </CardTitle>
              </div>
              <CardDescription className="text-red-500">
                An unexpected error occurred while loading this component.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {this.state.error?.message || "An unknown error occurred"}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="text-xs bg-gray-100 p-2 rounded">
                    <summary className="cursor-pointer font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>

                <Button
                  onClick={this.handleRefresh}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-500 text-center">
                  <Bug className="w-3 h-3 inline mr-1" />
                  Development Mode - Error details shown above
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
