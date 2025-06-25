
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PDFGenerationService } from '@/services/pdfGenerationService';

interface ReportExporterProps {
  onExport?: (format: string, reportType: string) => void;
}

const ReportExporter = ({ onExport }: ReportExporterProps) => {
  const [reportType, setReportType] = useState('comprehensive');
  const [format, setFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive System Report' },
    { value: 'schools', label: 'School Performance Report' },
    { value: 'financial', label: 'Financial Summary Report' },
    { value: 'system_health', label: 'System Health Report' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (reportType) {
        case 'comprehensive':
          await PDFGenerationService.generateComprehensiveReport();
          break;
        case 'schools':
          await PDFGenerationService.generateSchoolPerformanceReport();
          break;
        case 'financial':
          await PDFGenerationService.generateFinancialReport();
          break;
        case 'system_health':
          await PDFGenerationService.generateSystemHealthReport();
          break;
        default:
          throw new Error('Invalid report type selected');
      }
      
      toast({
        title: "Report Generated Successfully",
        description: `${reportTypes.find(r => r.value === reportType)?.label} has been downloaded as PDF`,
      });
      
      if (onExport) {
        onExport(format, reportType);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: "An error occurred while generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Current system data</span>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generating PDF...' : 'Export Report'}
          </Button>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Reports include real data from all schools in the network and are professionally formatted with EduFam branding.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExporter;
