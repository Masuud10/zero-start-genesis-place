import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExportButton from './shared/ExportButton';

interface ReportDownloadPanelProps {
  hideCard?: boolean;
  showAll?: boolean;
}

const ReportDownloadPanel: React.FC<ReportDownloadPanelProps> = ({ hideCard = false, showAll = false }) => {
  const handleExportPDF = () => window.print();
  const handleExportExcel = () => console.log('Excel export');

  const content = (
    <ExportButton onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
  );

  if (hideCard) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default ReportDownloadPanel;