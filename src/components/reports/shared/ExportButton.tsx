import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  loading?: boolean;
  showExcel?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExportPDF, 
  onExportExcel, 
  loading = false,
  showExcel = true 
}) => {
  const { toast } = useToast();

  const handleExport = (format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') {
        onExportPDF();
      } else {
        onExportExcel();
      }
      
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} report is being generated...`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => handleExport('pdf')}
        disabled={loading}
        className="flex items-center space-x-2"
      >
        <FileText className="h-4 w-4" />
        <span>Export PDF</span>
      </Button>
      
      {showExcel && (
        <Button
          onClick={() => handleExport('excel')}
          disabled={loading}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Excel</span>
        </Button>
      )}
    </div>
  );
};

export default ExportButton;