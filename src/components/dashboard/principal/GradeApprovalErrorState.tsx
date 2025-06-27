
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GradeApprovalErrorStateProps {
  error: any;
  onRetry: () => void;
}

export const GradeApprovalErrorState: React.FC<GradeApprovalErrorStateProps> = ({
  error,
  onRetry
}) => {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load grades</h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'There was an error loading the grade data. Please try again.'}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};
