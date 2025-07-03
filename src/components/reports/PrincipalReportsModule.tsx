import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { ReportService } from '@/services/reportService';
import { PrincipalReportFilters } from '@/types/report';
import ReportHeader from './shared/ReportHeader';
import ReportFooter from './shared/ReportFooter';
import ExportButton from './shared/ExportButton';
import { useToast } from '@/hooks/use-toast';

const PrincipalReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { students } = useStudents();
  const { classes } = useClasses();
  
  const [filters, setFilters] = useState<PrincipalReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'academic'
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    if (!user?.school_id) return;
    
    setLoading(true);
    try {
      let report;
      
      switch (filters.reportType) {
        case 'individual':
          if (!filters.studentId) {
            toast({
              title: "Missing Selection",
              description: "Please select a student for individual report.",
              variant: "destructive",
            });
            return;
          }
          report = await ReportService.generateStudentReport(filters.studentId, user.school_id);
          break;
        case 'financial':
          report = await ReportService.generateFeeCollectionReport(user.school_id, filters.startDate, filters.endDate);
          break;
        default:
          // For other report types, we'll use a generic approach
          report = {
            id: `${filters.reportType}-${Date.now()}`,
            title: `${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report`,
            generatedAt: new Date().toISOString(),
            schoolInfo: { name: 'School Report' },
            content: { message: `${filters.reportType} report data would be displayed here` }
          };
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
    window.print();
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Principal report data would be formatted as CSV here";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "principal_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Principal Reports</CardTitle>
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
                  <SelectItem value="individual">Individual Student Performance</SelectItem>
                  <SelectItem value="academic">Academic Performance (School-wide)</SelectItem>
                  <SelectItem value="class">Class-wise Performance</SelectItem>
                  <SelectItem value="subject">Subject Performance</SelectItem>
                  <SelectItem value="attendance">Attendance Overview</SelectItem>
                  <SelectItem value="financial">Financial Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.reportType === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select
                  value={filters.studentId || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, studentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filters.reportType === 'class' && (
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
              <h3 className="text-lg font-semibold">Report Summary</h3>
              
              {filters.reportType === 'individual' && reportData.content?.student && (
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
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.content.student.grades.slice(0, 10).map((grade: any, index: number) => (
                            <tr key={index}>
                              <td className="border border-border p-2">{grade.subject_name || 'Subject'}</td>
                              <td className="border border-border p-2">{grade.score}/{grade.max_score}</td>
                              <td className="border border-border p-2">{grade.letter_grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {filters.reportType === 'financial' && reportData.content?.transactions && (
                <div>
                  <h4 className="font-semibold mb-2">Financial Transactions</h4>
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Date</th>
                        <th className="border border-border p-2 text-left">Student</th>
                        <th className="border border-border p-2 text-left">Amount</th>
                        <th className="border border-border p-2 text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.content.transactions.slice(0, 10).map((transaction: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-border p-2">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="border border-border p-2">{transaction.student?.name}</td>
                          <td className="border border-border p-2">KES {transaction.amount}</td>
                          <td className="border border-border p-2">{transaction.transaction_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!reportData.content?.student && !reportData.content?.transactions && (
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

export default PrincipalReportsModule;