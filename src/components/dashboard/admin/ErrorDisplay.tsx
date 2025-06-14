
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  schoolsError: Error | null;
  usersError: Error | null;
  onRetryAll: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  schoolsError,
  usersError,
  onRetryAll
}) => {
  // Show comprehensive error state if both queries failed
  if (schoolsError && usersError) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Dashboard Loading Failed</h3>
            <p className="text-red-700 mb-4">
              Unable to load dashboard data. Please check your connection and try again.
            </p>
            <div className="space-y-2 text-sm text-red-600 mb-4">
              <p>Schools Error: {schoolsError.message}</p>
              <p>Users Error: {usersError.message}</p>
            </div>
            <Button onClick={onRetryAll} variant="outline" className="border-red-300 text-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry All
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show partial error state
  if (schoolsError || usersError) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Partial Data Loading Issue</span>
          </div>
          <div className="mt-2 text-sm text-yellow-600">
            {schoolsError && <p>Schools: {schoolsError.message}</p>}
            {usersError && <p>Users: {usersError.message}</p>}
          </div>
          <Button onClick={onRetryAll} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Failed Requests
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ErrorDisplay;
