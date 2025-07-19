
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class BillingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Billing Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <div className="mb-2">
                  Something went wrong with the billing module. Please try refreshing or contact support if the issue persists.
                </div>
                {this.state.error && (
                  <div className="text-xs text-red-600 mb-3 font-mono">
                    {this.state.error.message}
                  </div>
                )}
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default BillingErrorBoundary;
