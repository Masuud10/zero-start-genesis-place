
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface GradeApprovalErrorStateProps {
  error: any;
  onRetry: () => void;
}

export const GradeApprovalErrorState: React.FC<GradeApprovalErrorStateProps> = ({
  error,
  onRetry
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <XCircle className="h-5 w-5 text-red-500" />
        <h3 className="font-medium">Grade Approvals - Error</h3>
      </div>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load grades: {error?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
      <Button 
        onClick={onRetry} 
        className="mt-4"
        variant="outline"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
};
