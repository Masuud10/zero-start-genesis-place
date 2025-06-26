
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, BarChart3, Users, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TeacherReportsModule = () => {
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('current_term');
  const [selectedClass, setSelectedClass] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only allow grade and attendance reports for teachers
  const allowedReports = [
    {
      value: 'grade_report',
      label: 'Grade Report',
      description: 'Generate grade reports for your classes',
      icon: GraduationCap,
      color: 'blue'
    },
    {
      value: 'attendance_report',
      label: 'Attendance Report',
      description: 'Generate attendance reports for your classes',
      icon: Users,
      color: 'green'
    }
  ];

  // Mock class data - in real implementation, this would come from API
  const teacherClasses = [
    'Grade 8A - Mathematics',
    'Grade 8B - Mathematics',
    'Grade 7A - Mathematics'
  ];

  const handleGenerateReport = async () => {
    if (!reportType || !selectedClass) {
      toast({
        title: "Missing Information",
        description: "Please select both report type and class.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedReport = allowedReports.find(r => r.value === reportType);
      toast({
        title: "Report Generated Successfully",
        description: `${selectedReport?.label} for ${selectedClass} has been generated.`
      });

      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${selectedReport?.label}_${selectedClass}_${dateRange}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "An error occurred while generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teacher Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <div className="grid gap-3">
                {allowedReports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        reportType === report.value
                          ? `border-${report.color}-500 bg-${report.color}-50/50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setReportType(report.value)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 text-${report.color}-600`} />
                          <div>
                            <h4 className="font-medium">{report.label}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.description}
                            </p>
                          </div>
                        </div>
                        {reportType === report.value && (
                          <Badge variant="default" className={`bg-${report.color}-600`}>
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_term">Current Term</SelectItem>
                    <SelectItem value="current_year">Current Year</SelectItem>
                    <SelectItem value="last_term">Last Term</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Reports include professional formatting and school branding</span>
              </div>
              
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !reportType || !selectedClass}
                className="flex items-center gap-2 min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Teacher Report Access</h3>
              <p className="text-sm text-muted-foreground">
                As a teacher, you have access to generate grade and attendance reports for your assigned classes only. 
                For other report types, please contact your school administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherReportsModule;
