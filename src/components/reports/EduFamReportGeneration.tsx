
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  BarChart3, 
  Users, 
  DollarSign, 
  GraduationCap,
  Building2,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReportRequest {
  reportType: 'comprehensive' | 'academic' | 'financial' | 'attendance';
  schoolId?: string;
  academicYear: string;
  term?: string;
  includeCharts: boolean;
  customNote?: string;
}

const EduFamReportGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    reportType: 'comprehensive',
    academicYear: new Date().getFullYear().toString(),
    includeCharts: true,
  });

  // Fetch schools for report generation
  const { data: schools } = useQuery({
    queryKey: ['schools-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, location')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: user?.role === 'edufam_admin',
  });

  // Fetch recent reports
  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['edufam-recent-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          school:schools(name, location),
          generated_by_profile:profiles!reports_generated_by_fkey(name)
        `)
        .order('generated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: user?.role === 'edufam_admin',
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (request: ReportRequest) => {
      console.log('📊 Generating EduFam Admin report:', request);
      
      // Fetch comprehensive data based on report type
      let reportData: any = {};
      
      if (request.reportType === 'comprehensive' || request.reportType === 'academic') {
        // Fetch academic data
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select(`
            *,
            student:students(name, admission_number),
            subject:subjects(name, code),
            class:classes(name, level),
            school:schools(name, location)
          `)
          .eq('school_id', request.schoolId || '')
          .eq('status', 'released')
          .gte('created_at', `${request.academicYear}-01-01`)
          .lt('created_at', `${parseInt(request.academicYear) + 1}-01-01`);

        if (gradesError) throw gradesError;
        reportData.academic = gradesData;
      }

      if (request.reportType === 'comprehensive' || request.reportType === 'attendance') {
        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select(`
            *,
            student:students(name, admission_number),
            class:classes(name, level),
            school:schools(name, location)
          `)
          .eq('school_id', request.schoolId || '')
          .eq('academic_year', request.academicYear);

        if (attendanceError) throw attendanceError;
        reportData.attendance = attendanceData;
      }

      if (request.reportType === 'comprehensive' || request.reportType === 'financial') {
        // Fetch financial data
        const { data: financialData, error: financialError } = await supabase
          .from('financial_transactions')
          .select(`
            *,
            student:students(name, admission_number),
            school:schools(name, location)
          `)
          .eq('school_id', request.schoolId || '')
          .eq('academic_year', request.academicYear);

        if (financialError) throw financialError;
        reportData.financial = financialData;

        // Also fetch fees data
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select(`
            *,
            student:students(name, admission_number),
            school:schools(name, location)
          `)
          .eq('school_id', request.schoolId || '')
          .eq('academic_year', request.academicYear);

        if (feesError) throw feesError;
        reportData.fees = feesData;
      }

      // Calculate summary statistics
      const summary = {
        totalStudents: reportData.academic?.length || 0,
        averageGrade: reportData.academic?.reduce((sum: number, grade: any) => sum + (grade.percentage || 0), 0) / (reportData.academic?.length || 1),
        attendanceRate: reportData.attendance?.filter((a: any) => a.status === 'present').length / (reportData.attendance?.length || 1) * 100,
        totalRevenue: reportData.financial?.reduce((sum: number, trans: any) => sum + parseFloat(trans.amount || 0), 0) || 0,
        outstandingFees: reportData.fees?.reduce((sum: number, fee: any) => sum + (parseFloat(fee.amount || 0) - parseFloat(fee.paid_amount || 0)), 0) || 0,
      };

      // Store the report
      const { data: savedReport, error: saveError } = await supabase
        .from('reports')
        .insert({
          school_id: request.schoolId,
          generated_by: user?.id,
          report_type: request.reportType,
          report_data: { ...reportData, summary, metadata: request },
          filters: {
            academic_year: request.academicYear,
            term: request.term,
            report_type: request.reportType,
            include_charts: request.includeCharts
          }
        })
        .select()
        .single();

      if (saveError) throw saveError;
      
      return { report: savedReport, data: reportData, summary };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['edufam-recent-reports'] });
      toast({
        title: "Report Generated Successfully",
        description: `${result.report.report_type} report has been generated and saved.`,
      });
    },
    onError: (error: any) => {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!reportRequest.schoolId && reportRequest.reportType !== 'comprehensive') {
      toast({
        title: "School Selection Required",
        description: "Please select a school for this report type.",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate(reportRequest);
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Download Report",
      description: "Report download functionality will be implemented next.",
    });
    // TODO: Implement report download
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <GraduationCap className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'attendance':
        return <Users className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Access control check
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="p-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access report generation.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl text-gray-900">
          <FileText className="h-6 w-6 text-blue-600" />
          Report Generation
        </CardTitle>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generation Form */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="h-5 w-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <Select
                value={reportRequest.reportType}
                onValueChange={(value: any) => setReportRequest(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="academic">Academic Performance</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="attendance">Attendance Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target School
              </label>
              <Select
                value={reportRequest.schoolId || 'all'}
                onValueChange={(value) => setReportRequest(prev => ({ 
                  ...prev, 
                  schoolId: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {school.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <Select
                value={reportRequest.academicYear}
                onValueChange={(value) => setReportRequest(prev => ({ ...prev, academicYear: value }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term (Optional)
              </label>
              <Select
                value={reportRequest.term || 'all'}
                onValueChange={(value) => setReportRequest(prev => ({ 
                  ...prev, 
                  term: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any specific notes or requirements for this report..."
                value={reportRequest.customNote || ''}
                onChange={(e) => setReportRequest(prev => ({ ...prev, customNote: e.target.value }))}
                className="bg-white"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generateReportMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Loading recent reports...</p>
              </div>
            ) : !recentReports || recentReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No reports generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getReportTypeIcon(report.report_type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {report.report_type.replace('_', ' ')} Report
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          {report.school?.name || 'All Schools'}
                          <Calendar className="h-3 w-3 ml-2" />
                          {new Date(report.generated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge('completed')}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamReportGeneration;
