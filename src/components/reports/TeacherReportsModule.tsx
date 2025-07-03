import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useSubjects } from '@/hooks/useSubjects';
import { ReportService } from '@/services/reportService';
import { TeacherReportFilters } from '@/types/report';
import ReportHeader from './shared/ReportHeader';
import ReportFooter from './shared/ReportFooter';
import ExportButton from './shared/ExportButton';
import { useToast } from '@/hooks/use-toast';

const TeacherReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  
  const [filters, setFilters] = useState<TeacherReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'performance'
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    if (!user?.school_id) return;
    
    setLoading(true);
    try {
      let report;
      
      switch (filters.reportType) {
        case 'performance':
          if (!filters.classId) {
            toast({
              title: "Missing Selection",
              description: "Please select a class for performance report.",
              variant: "destructive",
            });
            return;
          }
          report = await ReportService.generateClassPerformanceReport(filters.classId, user.school_id);
          break;
        case 'subject':
          if (!filters.subjectId) {
            toast({
              title: "Missing Selection", 
              description: "Please select a subject for subject report.",
              variant: "destructive",
            });
            return;
          }
          report = await ReportService.generateSubjectPerformanceReport(filters.subjectId, user.school_id);
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      setReportData(report);
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // PDF export functionality
    window.print();
  };

  const handleExportExcel = () => {
    // Excel export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Report data would be formatted as CSV here";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Class Performance</SelectItem>
                  <SelectItem value="subject">Subject Performance</SelectItem>
                  <SelectItem value="attendance">Attendance Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.reportType === 'performance' && (
              <div className="space-y-2">
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={filters.classId || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, classId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filters.reportType === 'subject' && (
              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject</Label>
                <Select
                  value={filters.subjectId || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subjectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              onClick={handleGenerateReport} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <span>{loading ? 'Generating...' : 'Generate Report'}</span>
            </Button>

            {reportData && (
              <ExportButton
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                loading={loading}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card className="print:shadow-none">
          <CardContent className="p-6">
            <ReportHeader
              schoolInfo={reportData.schoolInfo}
              title={reportData.title}
              generatedAt={reportData.generatedAt}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Report Data</h3>
              {reportData.content?.grades?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Student</th>
                        <th className="border border-border p-2 text-left">Subject</th>
                        <th className="border border-border p-2 text-left">Score</th>
                        <th className="border border-border p-2 text-left">Grade</th>
                        <th className="border border-border p-2 text-left">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.content.grades.map((grade: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-border p-2">{grade.student?.name}</td>
                          <td className="border border-border p-2">{grade.subject?.name}</td>
                          <td className="border border-border p-2">{grade.score}/{grade.max_score}</td>
                          <td className="border border-border p-2">{grade.letter_grade}</td>
                          <td className="border border-border p-2">{grade.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available for the selected criteria.</p>
              )}
            </div>

            <ReportFooter />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherReportsModule;