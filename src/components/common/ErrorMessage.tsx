
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  className,
  showDetails = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isPermissionError = errorMessage.includes('Access denied') || errorMessage.includes('Authentication');

  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isPermissionError ? 'Access Denied' : 'Something went wrong'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {isPermissionError 
            ? 'You do not have permission to access this resource.'
            : 'We encountered an error while loading this data.'
          }
        </p>
        
        {showDetails && process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-red-600 overflow-auto">
              {typeof error === 'string' ? error : error.stack}
            </pre>
          </details>
        )}

        {onRetry && !isPermissionError && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
