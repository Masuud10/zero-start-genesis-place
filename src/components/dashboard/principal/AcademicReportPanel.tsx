
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface AcademicReportPanelProps {
  downloadingReport: boolean;
  setDownloadingReport: (val: boolean) => void;
  user: any;
  schoolId: string | undefined;
  toast: any;
}

const AcademicReportPanel: React.FC<AcademicReportPanelProps> = ({
  downloadingReport,
  setDownloadingReport,
  user,
  schoolId,
  toast
}) => {
  const handleDownloadAcademicReport = async () => {
    setDownloadingReport(true);
    try {
      // Mock academic report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "Academic report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate academic report.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadAcademicReport}
      disabled={downloadingReport}
      variant="outline"
      className="flex items-center gap-2"
    >
      <FileText className="w-4 h-4" />
      {downloadingReport ? "Generating..." : "Download Academic Report"}
    </Button>
  );
};

export default AcademicReportPanel;
