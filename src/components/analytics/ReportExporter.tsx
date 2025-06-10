
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    { value: 'support', label: 'Support Analytics Report' },
    { value: 'system_health', label: 'System Health Report' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Successful",
        description: `${reportTypes.find(r => r.value === reportType)?.label} exported as ${format.toUpperCase()}`,
      });
      
      if (onExport) {
        onExport(format, reportType);
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the report.",
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
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Current month data</span>
          </div>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Reports include data from all schools in the network. Exported files will be available for download immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExporter;
