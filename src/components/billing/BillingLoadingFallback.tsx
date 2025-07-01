
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

interface BillingLoadingFallbackProps {
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  title?: string;
  timeout?: number;
}

const BillingLoadingFallback: React.FC<BillingLoadingFallbackProps> = ({
  isLoading,
  error,
  onRetry,
  title = "Billing Management",
  timeout = 15000
}) => {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span className="text-muted-foreground">Loading billing data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default BillingLoadingFallback;
