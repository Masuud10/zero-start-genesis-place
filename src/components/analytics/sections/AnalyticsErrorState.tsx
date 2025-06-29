
import React from 'react';
import { TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AnalyticsErrorStateProps {
  onRetry: () => void;
}

const AnalyticsErrorState = ({ onRetry }: AnalyticsErrorStateProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
      </div>
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700 flex items-center justify-between">
          <span>Failed to load system analytics. Please try refreshing the data.</span>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AnalyticsErrorState;
