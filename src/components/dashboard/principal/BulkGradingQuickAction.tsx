
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Award } from 'lucide-react';

interface BulkGradingQuickActionProps {
  onOpenBulkGrade: () => void;
}

const BulkGradingQuickAction = ({ onOpenBulkGrade }: BulkGradingQuickActionProps) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Grade Management
        </CardTitle>
        <p className="text-gray-600 text-sm">Efficiently manage student grades</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            onClick={onOpenBulkGrade}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bulk Grade Entry
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Grade Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkGradingQuickAction;
