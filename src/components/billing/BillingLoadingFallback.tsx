
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingStates';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BillingLoadingFallbackProps {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  timeout?: number; // in milliseconds
}

const BillingLoadingFallback: React.FC<BillingLoadingFallbackProps> = ({
  isLoading,
  error,
  onRetry,
  title = "Loading",
  timeout = 30000 // 30 seconds default
}) => {
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setTimeoutReached(false);
      setTimeElapsed(0);
      return;
    }

    setTimeElapsed(0);
    
    // Update elapsed time every second
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1000);
    }, 1000);

    // Set timeout warning
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Loading timeout reached:', timeout / 1000, 'seconds');
        setTimeoutReached(true);
      }
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, timeout]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            Error Loading {title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error.includes('timed out') 
              ? 'The request took too long to complete. This might be due to network issues or high server load.'
              : 'We encountered an error while loading the data.'
            }
          </p>
          
          <Alert variant="destructive" className="mb-4 text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Error Details:</strong> {error}
            </AlertDescription>
          </Alert>

          {onRetry && (
            <div className="flex justify-center gap-2">
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Loading {title}...
          </h3>
          <p className="text-muted-foreground mb-4">
            Please wait while we fetch your data
          </p>
          
          <div className="text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4 inline mr-1" />
            Time elapsed: {formatTime(timeElapsed)}
          </div>
          
          {timeoutReached && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is taking longer than expected. The system is still working, but you can try refreshing if needed.
              </AlertDescription>
            </Alert>
          )}

          {onRetry && timeoutReached && (
            <Button 
              variant="outline" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default BillingLoadingFallback;
