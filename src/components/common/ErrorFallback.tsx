import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorFallbackProps {
  error?: Error | string;
  resetError?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  context?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  onGoHome,
  showDetails = false,
  context = 'application'
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  const errorStack = typeof error === 'object' && error?.stack;

  // Determine error type and provide specific guidance
  const getErrorGuidance = () => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'There seems to be a network connectivity issue.',
        suggestion: 'Please check your internet connection and try again.'
      };
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        suggestion: 'Contact your administrator if you believe this is an error.'
      };
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        title: 'Resource Not Found',
        description: 'The requested resource could not be found.',
        suggestion: 'The item may have been moved or deleted.'
      };
    }
    
    if (message.includes('database') || message.includes('sql')) {
      return {
        title: 'Database Error',
        description: 'There was a problem accessing the database.',
        suggestion: 'This is likely a temporary issue. Please try again.'
      };
    }

    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The operation took too long to complete.',
        suggestion: 'The server may be experiencing high load. Please try again.'
      };
    }
    
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred in the application.',
      suggestion: 'Please try refreshing the page or contact support if the problem persists.'
    };
  };

  const guidance = getErrorGuidance();

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {guidance.title}
          </CardTitle>
          <CardDescription className="text-red-700">
            {guidance.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              {guidance.suggestion}
            </AlertDescription>
          </Alert>

          {/* Error Details for Development */}
          {(showDetails || process.env.NODE_ENV === 'development') && (
            <details className="text-xs">
              <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
                Technical Details
              </summary>
              <div className="bg-red-100 p-3 rounded border text-red-800 font-mono">
                <div><strong>Context:</strong> {context}</div>
                <div><strong>Error:</strong> {errorMessage}</div>
                {errorStack && (
                  <div className="mt-2">
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 max-h-32 overflow-auto">
                      {errorStack}
                    </pre>
                  </div>
                )}
                <div className="mt-2">
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </div>
                <div>
                  <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
                </div>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={handleGoHome}
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Help Link */}
          <div className="text-center pt-2 border-t border-red-200">
            <p className="text-xs text-red-600">
              If this problem continues, please contact support with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;