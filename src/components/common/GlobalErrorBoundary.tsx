import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Global Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to audit system
    this.logError(error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private async logError(error: Error, errorInfo: any) {
    try {
      // Import dynamically to avoid circular dependencies
      const { auditLogger } = await import('@/utils/auditLogger');
      
      await auditLogger.log({
        action: 'FRONTEND_ERROR',
        resource: 'error_boundary',
        success: false,
        error_message: error.message,
        metadata: {
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          retryCount: this.retryCount,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (logError) {
      console.error('Failed to log error to audit system:', logError);
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying... Attempt ${this.retryCount}/${this.maxRetries}`);
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    } else {
      console.error('🚨 Max retries exceeded, reloading page');
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private shouldShowDetails = (): boolean => {
    return process.env.NODE_ENV === 'development' || 
           window.location.search.includes('debug=true');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRecoverable = this.retryCount < this.maxRetries;
      const showDetails = this.shouldShowDetails();

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {isRecoverable ? 'Something went wrong' : 'Application Error'}
                    </h3>
                    <p className="text-sm">
                      {isRecoverable 
                        ? 'We encountered an unexpected error. You can try again or reload the page.'
                        : 'Multiple errors occurred. Please reload the page to continue.'
                      }
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isRecoverable && (
                      <Button 
                        onClick={this.handleRetry}
                        variant="outline"
                        size="sm"
                        className="text-red-700 border-red-300 hover:bg-red-100"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again ({this.maxRetries - this.retryCount} left)
                      </Button>
                    )}
                    <Button 
                      onClick={this.handleReload}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reload Page
                    </Button>
                  </div>

                  {showDetails && this.state.error && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                        Technical Details (Development Mode)
                      </summary>
                      <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                        <div><strong>Error:</strong> {this.state.error.message}</div>
                        <div><strong>Stack:</strong></div>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    </details>
                  )}

                  <div className="text-xs text-red-600">
                    Error ID: {this.state.errorId}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary fallback={fallback}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default GlobalErrorBoundary;