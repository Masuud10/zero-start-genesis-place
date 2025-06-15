
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

interface BulkGradingQuickActionProps {
  onOpenBulkGrade: () => void;
}

const BulkGradingQuickAction: React.FC<BulkGradingQuickActionProps> = ({ onOpenBulkGrade }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grading Actions</CardTitle>
        <CardDescription>Enter grades for an entire class at once.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onOpenBulkGrade}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Bulk Grade Entry
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkGradingQuickAction;
