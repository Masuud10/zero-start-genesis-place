
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, BarChart3, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportsGenerator: React.FC = () => {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance Report', icon: BarChart3 },
    { value: 'attendance', label: 'Attendance Summary Report', icon: Calendar },
    { value: 'financial', label: 'Financial Summary Report', icon: FileText },
    { value: 'comprehensive', label: 'Comprehensive School Report', icon: Users }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReportType || !selectedPeriod) {
      toast({
        title: "Missing Information",
        description: "Please select both report type and period",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const reportName = reportTypes.find(r => r.value === selectedReportType)?.label;
      toast({
        title: "Report Generated",
        description: `${reportName} for ${selectedPeriod} has been generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.value} value={report.value}>
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4" />
                        {report.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-week">Current Week</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="current-term">Current Term</SelectItem>
                  <SelectItem value="academic-year">Academic Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport} 
            disabled={generating || !selectedReportType || !selectedPeriod}
            className="w-full"
          >
            {generating ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Academic Performance Report</p>
                <p className="text-sm text-muted-foreground">Generated on March 15, 2024 • Current Term</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Ready</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Financial Summary Report</p>
                <p className="text-sm text-muted-foreground">Generated on March 10, 2024 • Current Month</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Ready</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsGenerator;
