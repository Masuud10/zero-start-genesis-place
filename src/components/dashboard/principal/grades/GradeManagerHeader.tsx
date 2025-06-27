
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface GradeManagerHeaderProps {
  onGenerateReports: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const GradeManagerHeader: React.FC<GradeManagerHeaderProps> = ({
  onGenerateReports,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold">Grade Management</h3>
        <p className="text-sm text-muted-foreground">
          Review, approve, and release student grades
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onGenerateReports}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Reports
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
