
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, BarChart3, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportsModalProps {
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('');
  const [format, setFormat] = useState('pdf');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance Report', icon: BarChart3 },
    { value: 'attendance', label: 'Attendance Report', icon: Users },
    { value: 'financial', label: 'Financial Report', icon: FileText },
    { value: 'student_progress', label: 'Student Progress Report', icon: BarChart3 },
    { value: 'class_summary', label: 'Class Summary Report', icon: Users },
  ];

  const periods = [
    'This Week',
    'This Month', 
    'This Term',
    'This Year',
    'Last Month',
    'Last Term',
    'Custom Range'
  ];

  const classes = [
    'Grade 8A',
    'Grade 8B', 
    'Grade 7A',
    'Grade 7B',
    'Grade 6A'
  ];

  const handleClassSelection = (className: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, className]);
    } else {
      setSelectedClasses(prev => prev.filter(c => c !== className));
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType || !period) {
      toast({
        title: "Missing Information",
        description: "Please select report type and period.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const selectedReport = reportTypes.find(r => r.value === reportType);
      toast({
        title: "Report Generated",
        description: `${selectedReport?.label} has been generated and downloaded.`,
      });
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${selectedReport?.label.replace(/ /g, '_')}_${period.replace(/ /g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReportType = reportTypes.find(r => r.value === reportType);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Reports</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="period">Time Period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {(reportType === 'academic' || reportType === 'attendance' || reportType === 'class_summary') && (
            <Card>
              <CardHeader>
                <CardTitle>Select Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {classes.map((className) => (
                    <div key={className} className="flex items-center space-x-2">
                      <Checkbox
                        id={className}
                        checked={selectedClasses.includes(className)}
                        onCheckedChange={(checked) => handleClassSelection(className, checked as boolean)}
                      />
                      <Label htmlFor={className}>{className}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedReportType && (
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <selectedReportType.icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">{selectedReportType.label}</p>
                  <p className="text-muted-foreground mb-4">
                    Period: {period || 'Not selected'} | Format: {format.toUpperCase()}
                  </p>
                  {selectedClasses.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Classes: {selectedClasses.join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
