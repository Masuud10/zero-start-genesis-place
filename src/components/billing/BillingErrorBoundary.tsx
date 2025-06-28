
import React from 'react';
import { ErrorBoundary } from '@/utils/errorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface BillingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const BillingErrorFallback: React.FC<{ error?: Error; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Billing System Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700">
            The billing management system encountered an unexpected error. This could be due to:
          </p>
          <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
            <li>Network connectivity issues</li>
            <li>Database timeout or connection problems</li>
            <li>Server overload during peak hours</li>
            <li>Temporary service interruption</li>
          </ul>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="bg-red-100 p-4 rounded text-sm">
              <summary className="cursor-pointer font-medium text-red-800">
                Technical Details (Development Only)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-red-600 text-xs overflow-auto">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-2 pt-4">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="flex items-center gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BillingErrorBoundary: React.FC<BillingErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <ErrorBoundary
      fallback={fallback || <BillingErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('🚨 Billing Error Boundary caught error:', error, errorInfo);
        
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
          console.error('Production billing error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default BillingErrorBoundary;
