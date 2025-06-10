
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, BarChart3, Users, GraduationCap, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrincipalReportsModalProps {
  onClose: () => void;
}

const PrincipalReportsModal: React.FC<PrincipalReportsModalProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('');
  const [format, setFormat] = useState('pdf');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'academic_performance', label: 'Academic Performance Report', icon: BarChart3, description: 'Student grades and academic progress' },
    { value: 'attendance_summary', label: 'Attendance Summary Report', icon: Calendar, description: 'Daily and monthly attendance statistics' },
    { value: 'teacher_performance', label: 'Teacher Performance Report', icon: Users, description: 'Teaching staff evaluation and metrics' },
    { value: 'student_enrollment', label: 'Student Enrollment Report', icon: GraduationCap, description: 'New admissions and enrollment trends' },
    { value: 'class_overview', label: 'Class Overview Report', icon: FileText, description: 'Class-wise student and performance data' },
    { value: 'disciplinary', label: 'Disciplinary Report', icon: Users, description: 'Student discipline and behavioral records' }
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
    'Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A',
    'Grade 4A', 'Grade 4B', 'Grade 5A', 'Grade 5B', 'Grade 6A'
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
      // Simulate report generation with realistic data
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const selectedReport = reportTypes.find(r => r.value === reportType);
      
      // Generate sample report data
      const reportData = generateSampleReportData(reportType, period, selectedClasses);
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport?.label.replace(/ /g, '_')}_${period.replace(/ /g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated Successfully",
        description: `${selectedReport?.label} for ${period} has been generated and downloaded.`,
      });
      
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

  const generateSampleReportData = (type: string, period: string, classes: string[]) => {
    const baseData = {
      reportType: type,
      period: period,
      generatedAt: new Date().toISOString(),
      school: "Demo School",
      generatedBy: "Principal"
    };

    switch (type) {
      case 'academic_performance':
        return {
          ...baseData,
          data: {
            totalStudents: 245,
            averageGrade: 78.5,
            subjectPerformance: [
              { subject: 'Mathematics', average: 75.2, students: 245 },
              { subject: 'English', average: 82.1, students: 245 },
              { subject: 'Science', average: 79.8, students: 245 }
            ],
            classPerformance: classes.map(cls => ({
              class: cls,
              students: Math.floor(Math.random() * 30) + 20,
              average: Math.floor(Math.random() * 30) + 70
            }))
          }
        };
      
      case 'attendance_summary':
        return {
          ...baseData,
          data: {
            overallAttendance: 92.3,
            totalStudents: 245,
            attendanceByClass: classes.map(cls => ({
              class: cls,
              attendance: Math.floor(Math.random() * 10) + 90,
              present: Math.floor(Math.random() * 30) + 20,
              absent: Math.floor(Math.random() * 5) + 1
            }))
          }
        };
      
      default:
        return { ...baseData, data: "Sample report data" };
    }
  };

  const selectedReportType = reportTypes.find(r => r.value === reportType);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Principal Reports</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {(reportType === 'academic_performance' || reportType === 'attendance_summary' || reportType === 'class_overview') && (
            <Card>
              <CardHeader>
                <CardTitle>Select Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-muted-foreground mb-2">{selectedReportType.description}</p>
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

export default PrincipalReportsModal;
