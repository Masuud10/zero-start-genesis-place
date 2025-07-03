import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ReportService } from '@/services/reportService';
import { ParentReportFilters } from '@/types/report';
import ReportHeader from './shared/ReportHeader';
import ReportFooter from './shared/ReportFooter';
import ExportButton from './shared/ExportButton';
import { useToast } from '@/hooks/use-toast';

interface ChildInfo {
  studentId: string;
  studentName: string;
}

const ParentReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  
  const [filters, setFilters] = useState<ParentReportFilters>({
    studentId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'academic'
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user?.id) return;

    try {
      const { data: parentStudents } = await supabase
        .from('parent_students')
        .select(`
          student_id,
          students!inner(
            id,
            name
          )
        `)
        .eq('parent_id', user.id);

      if (parentStudents) {
        const childrenInfo = parentStudents.map(ps => ({
          studentId: ps.student_id,
          studentName: ps.students.name
        }));
        setChildren(childrenInfo);
        
        if (childrenInfo.length > 0 && !filters.studentId) {
          setFilters(prev => ({ ...prev, studentId: childrenInfo[0].studentId }));
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!filters.studentId) {
      toast({
        title: "Missing Selection",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      let report;
      
      switch (filters.reportType) {
        case 'academic':
          report = await ReportService.generateStudentAcademicReport(filters.studentId);
          break;
        case 'attendance':
        case 'fees':
          // For now, use a generic approach for these report types
          const selectedChild = children.find(c => c.studentId === filters.studentId);
          report = {
            id: `${filters.reportType}-${Date.now()}`,
            title: `Student ${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report`,
            generatedAt: new Date().toISOString(),
            schoolInfo: { name: 'Student Report' },
            content: { 
              studentName: selectedChild?.studentName,
              message: `${filters.reportType} report data for ${selectedChild?.studentName} would be displayed here` 
            }
          };
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      setReportData(report);
      toast({
        title: "Report Generated",
        description: "Your child's report has been generated successfully.",
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
    window.print();
  };

  const handleExportExcel = () => {
    // Parents only get PDF exports for security
    toast({
      title: "Export Not Available",
      description: "Excel export is not available for parent reports for security reasons.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Select Child</Label>
              <Select
                value={filters.studentId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, studentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.studentId} value={child.studentId}>
                      {child.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="academic">Student Academic Report</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="fees">Fee Payment History</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              disabled={loading || children.length === 0}
              className="flex items-center space-x-2"
            >
              <span>{loading ? 'Generating...' : 'Generate Report'}</span>
            </Button>

            {reportData && (
              <ExportButton
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                loading={loading}
                showExcel={false}
              />
            )}
          </div>

          {children.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No children found. Please contact the school administration.
            </p>
          )}
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
              <h3 className="text-lg font-semibold">Student Information</h3>
              
              {reportData.content?.student && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Student Name:</strong> {reportData.content.student.name}
                    </div>
                    <div>
                      <strong>Admission Number:</strong> {reportData.content.student.admission_number}
                    </div>
                  </div>
                  
                  {reportData.content.student.grades?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Academic Performance</h4>
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left">Subject</th>
                            <th className="border border-border p-2 text-left">Score</th>
                            <th className="border border-border p-2 text-left">Grade</th>
                            <th className="border border-border p-2 text-left">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.content.student.grades.slice(0, 10).map((grade: any, index: number) => (
                            <tr key={index}>
                              <td className="border border-border p-2">{grade.subject_name || 'Subject'}</td>
                              <td className="border border-border p-2">{grade.score}/{grade.max_score}</td>
                              <td className="border border-border p-2">{grade.letter_grade}</td>
                              <td className="border border-border p-2">{grade.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {reportData.content.student.attendance?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Attendance Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded">
                          <div className="text-sm text-green-600">Present Days</div>
                          <div className="text-xl font-bold text-green-800">
                            {reportData.content.student.attendance.filter((a: any) => a.status === 'present').length}
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded">
                          <div className="text-sm text-red-600">Absent Days</div>
                          <div className="text-xl font-bold text-red-800">
                            {reportData.content.student.attendance.filter((a: any) => a.status === 'absent').length}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="text-sm text-blue-600">Total Days</div>
                          <div className="text-xl font-bold text-blue-800">
                            {reportData.content.student.attendance.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!reportData.content?.student && (
                <p className="text-muted-foreground">
                  {reportData.content?.message || 'Report data will be displayed here.'}
                </p>
              )}
            </div>

            <ReportFooter />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentReportsModule;