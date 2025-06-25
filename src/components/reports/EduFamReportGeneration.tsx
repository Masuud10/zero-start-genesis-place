
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Building2, Users, DollarSign, AlertCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportEnhancementService } from '@/services/system/reportEnhancementService';
import { format } from 'date-fns';

const EduFamReportGeneration = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('current_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [format as formatType, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch company-level data for reports
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      return await ReportEnhancementService.getSystemMetrics();
    }
  });

  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          location,
          created_at,
          students:students(count),
          classes:classes(count),
          teachers:profiles!profiles_school_id_fkey(count)
        `);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data: fees, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, school_id');
      
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, school_id');

      if (feesError || expensesError) throw feesError || expensesError;

      const totalRevenue = fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      
      return {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        feesData: fees,
        expensesData: expenses
      };
    }
  });

  const { data: supportData, isLoading: supportLoading } = useQuery({
    queryKey: ['support-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, priority, created_at, school_id');
      
      if (error) throw error;

      const totalTickets = data?.length || 0;
      const openTickets = data?.filter(ticket => ticket.status === 'open').length || 0;
      const closedTickets = data?.filter(ticket => ticket.status === 'closed').length || 0;
      const highPriorityTickets = data?.filter(ticket => ticket.priority === 'high').length || 0;

      return {
        totalTickets,
        openTickets,
        closedTickets,
        highPriorityTickets,
        ticketsData: data
      };
    }
  });

  const reportTypes = [
    { 
      value: 'system_overview', 
      label: 'System Overview Report',
      description: 'Complete system statistics and performance metrics',
      icon: BarChart3
    },
    { 
      value: 'schools_summary', 
      label: 'Schools Summary Report',
      description: 'All schools enrollment and performance data',
      icon: Building2
    },
    { 
      value: 'financial_overview', 
      label: 'Financial Overview Report',
      description: 'Revenue, expenses, and financial health across all schools',
      icon: DollarSign
    },
    { 
      value: 'support_analytics', 
      label: 'Support Analytics Report',
      description: 'Support ticket trends and resolution metrics',
      icon: AlertCircle
    },
    { 
      value: 'user_engagement', 
      label: 'User Engagement Report',
      description: 'User activity and system usage patterns',
      icon: Users
    }
  ];

  const getDateRangeFilter = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (dateRange) {
      case 'current_month':
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
      case 'last_month':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0)
        };
      case 'current_year':
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31)
        };
      case 'last_year':
        return {
          start: new Date(currentYear - 1, 0, 1),
          end: new Date(currentYear - 1, 11, 31)
        };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : new Date(),
          end: customEndDate ? new Date(customEndDate) : new Date()
        };
      default:
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
    }
  };

  const generateReportData = () => {
    const dateFilter = getDateRangeFilter();
    const reportData = {
      reportType: reportTypes.find(r => r.value === reportType)?.label || 'Unknown Report',
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: format(dateFilter.start, 'yyyy-MM-dd'),
        end: format(dateFilter.end, 'yyyy-MM-dd')
      },
      systemMetrics: systemMetrics || {},
      schools: schoolsData || [],
      financial: financialData || {},
      support: supportData || {}
    };

    return reportData;
  };

  const downloadReport = (data: any, filename: string, type: string) => {
    let content = '';
    let mimeType = '';
    let fileExtension = '';

    if (type === 'pdf') {
      // Generate text content for PDF (could be enhanced with proper PDF generation)
      content = generateTextReport(data);
      mimeType = 'text/plain';
      fileExtension = 'txt'; // Using .txt as placeholder for PDF
    } else if (type === 'excel') {
      // Generate CSV content for Excel
      content = generateCSVReport(data);
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (data: any) => {
    let report = `EDUFAM SYSTEM REPORT\n`;
    report += `========================\n\n`;
    report += `Report Type: ${data.reportType}\n`;
    report += `Generated At: ${new Date(data.generatedAt).toLocaleString()}\n`;
    report += `Date Range: ${data.dateRange.start} to ${data.dateRange.end}\n\n`;

    report += `SYSTEM METRICS\n`;
    report += `--------------\n`;
    report += `Total Schools: ${data.systemMetrics.totalSchools || 0}\n`;
    report += `Total Users: ${data.systemMetrics.totalUsers || 0}\n`;
    report += `Active Schools: ${data.systemMetrics.activeSchools || 0}\n`;
    report += `System Uptime: ${data.systemMetrics.systemUptime || 0}%\n\n`;

    if (data.schools && data.schools.length > 0) {
      report += `SCHOOLS SUMMARY\n`;
      report += `---------------\n`;
      data.schools.forEach((school: any, index: number) => {
        report += `${index + 1}. ${school.name} (${school.location})\n`;
        report += `   Created: ${new Date(school.created_at).toLocaleDateString()}\n`;
        report += `   Students: ${school.students?.[0]?.count || 0}\n`;
        report += `   Classes: ${school.classes?.[0]?.count || 0}\n`;
        report += `   Teachers: ${school.teachers?.[0]?.count || 0}\n\n`;
      });
    }

    if (data.financial) {
      report += `FINANCIAL SUMMARY\n`;
      report += `-----------------\n`;
      report += `Total Revenue: KES ${(data.financial.totalRevenue || 0).toLocaleString()}\n`;
      report += `Total Expenses: KES ${(data.financial.totalExpenses || 0).toLocaleString()}\n`;
      report += `Net Income: KES ${(data.financial.netIncome || 0).toLocaleString()}\n\n`;
    }

    if (data.support) {
      report += `SUPPORT SUMMARY\n`;
      report += `---------------\n`;
      report += `Total Tickets: ${data.support.totalTickets || 0}\n`;
      report += `Open Tickets: ${data.support.openTickets || 0}\n`;
      report += `Closed Tickets: ${data.support.closedTickets || 0}\n`;
      report += `High Priority Tickets: ${data.support.highPriorityTickets || 0}\n`;
    }

    return report;
  };

  const generateCSVReport = (data: any) => {
    let csv = 'Report Type,Generated At,Date Range Start,Date Range End\n';
    csv += `${data.reportType},${new Date(data.generatedAt).toLocaleString()},${data.dateRange.start},${data.dateRange.end}\n\n`;

    csv += 'Metric,Value\n';
    csv += `Total Schools,${data.systemMetrics.totalSchools || 0}\n`;
    csv += `Total Users,${data.systemMetrics.totalUsers || 0}\n`;
    csv += `Active Schools,${data.systemMetrics.activeSchools || 0}\n`;
    csv += `System Uptime,${data.systemMetrics.systemUptime || 0}%\n\n`;

    if (data.schools && data.schools.length > 0) {
      csv += 'School Name,Location,Created Date,Students,Classes,Teachers\n';
      data.schools.forEach((school: any) => {
        csv += `${school.name},${school.location},${school.created_at},${school.students?.[0]?.count || 0},${school.classes?.[0]?.count || 0},${school.teachers?.[0]?.count || 0}\n`;
      });
    }

    return csv;
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast({
        title: "Please specify custom date range",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const reportData = generateReportData();
      const filename = `edufam_${reportType}_${format(new Date(), 'yyyy-MM-dd')}`;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      downloadReport(reportData, filename, formatType);
      
      toast({
        title: "Report Generated Successfully",
        description: `${reportTypes.find(r => r.value === reportType)?.label} has been downloaded.`
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: "An error occurred while generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = metricsLoading || schoolsLoading || financialLoading || supportLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">EduFam System Reports</h2>
        <p className="text-muted-foreground">
          Generate comprehensive company-level reports with real-time data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="current_year">Current Year</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={formatType} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={!reportType || isGenerating || isLoading}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Schools</span>
                    <span className="font-semibold">{systemMetrics?.totalSchools || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Users</span>
                    <span className="font-semibold">{systemMetrics?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Schools</span>
                    <span className="font-semibold">{systemMetrics?.activeSchools || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">System Uptime</span>
                    <span className="font-semibold">{systemMetrics?.systemUptime || 0}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold text-green-600">
                      KES {(financialData?.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Net Income</span>
                    <span className="font-semibold">
                      KES {(financialData?.netIncome || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EduFamReportGeneration;
