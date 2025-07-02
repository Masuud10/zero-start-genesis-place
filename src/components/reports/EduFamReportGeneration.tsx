
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, AlertTriangle, Calendar, Building2, Users, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface School {
  id: string;
  name: string;
}

interface ReportConfig {
  type: string;
  title: string;
  description: string;
  icon: any;
  requiredData: string[];
}

const EduFamReportGeneration = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const reportConfigs: ReportConfig[] = [
    {
      type: 'school_overview',
      title: 'School Overview Report',
      description: 'Comprehensive report including student count, staff, and basic statistics',
      icon: Building2,
      requiredData: ['schools', 'students', 'profiles']
    },
    {
      type: 'user_analytics',
      title: 'User Analytics Report',
      description: 'Detailed analysis of user roles, activity, and engagement metrics',
      icon: Users,
      requiredData: ['profiles', 'user_login_details']
    },
    {
      type: 'system_performance',
      title: 'System Performance Report',
      description: 'System health, performance metrics, and usage statistics',
      icon: BarChart3,
      requiredData: ['system_settings', 'security_audit_logs']
    },
    {
      type: 'financial_summary',
      title: 'Financial Summary Report',
      description: 'Revenue, billing, and financial analytics across all schools',
      icon: Calendar,
      requiredData: ['school_billing_records', 'schools']
    }
  ];

  const fetchSchools = async () => {
    try {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access reports.');
      }

      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) throw error;

      setSchools(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load schools');
      console.error('🔴 EduFamReportGeneration: Error fetching schools:', err);
    }
  };

  const generateReport = async (reportType: string, format: 'pdf' | 'excel') => {
    try {
      setLoading(true);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can generate reports.');
      }

      // Fetch data based on report type
      let reportData: any = {};
      const reportConfig = reportConfigs.find(config => config.type === reportType);

      if (!reportConfig) {
        throw new Error('Invalid report type selected');
      }

      // Fetch required data for the report
      if (reportConfig.requiredData.includes('schools')) {
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('*')
          .eq(selectedSchool ? 'id' : 'id', selectedSchool || undefined);

        if (schoolsError && schoolsError.code !== 'PGRST116') throw schoolsError;
        reportData.schools = schoolsData || [];
      }

      if (reportConfig.requiredData.includes('profiles')) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq(selectedSchool ? 'school_id' : 'school_id', selectedSchool || undefined);

        if (usersError && usersError.code !== 'PGRST116') throw usersError;
        reportData.users = usersData || [];
      }

      if (reportConfig.requiredData.includes('students')) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq(selectedSchool ? 'school_id' : 'school_id', selectedSchool || undefined);

        if (studentsError && studentsError.code !== 'PGRST116') throw studentsError;
        reportData.students = studentsData || [];
      }

      if (reportConfig.requiredData.includes('school_billing_records')) {
        const { data: billingData, error: billingError } = await supabase
          .from('school_billing_records')
          .select('*')
          .eq(selectedSchool ? 'school_id' : 'school_id', selectedSchool || undefined);

        if (billingError && billingError.code !== 'PGRST116') throw billingError;
        reportData.billing = billingData || [];
      }

      // Generate report content based on type and format
      if (format === 'excel') {
        generateExcelReport(reportType, reportData);
      } else {
        generatePDFReport(reportType, reportData);
      }

      toast({
        title: "Report Generated",
        description: `${reportConfig.title} has been generated and downloaded successfully.`,
      });

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = (reportType: string, data: any) => {
    // Create CSV content based on report type
    let csvContent = '';
    const reportConfig = reportConfigs.find(config => config.type === reportType);

    switch (reportType) {
      case 'school_overview':
        csvContent = [
          ['School Overview Report', ''],
          ['Generated', new Date().toLocaleDateString()],
          [''],
          ['School Name', 'Total Students', 'Total Staff', 'Status'],
          ...(data.schools || []).map((school: any) => [
            school.name,
            data.students?.filter((s: any) => s.school_id === school.id).length || 0,
            data.users?.filter((u: any) => u.school_id === school.id && u.role !== 'parent').length || 0,
            school.status || 'active'
          ])
        ].map(row => row.join(',')).join('\n');
        break;

      case 'user_analytics':
        csvContent = [
          ['User Analytics Report', ''],
          ['Generated', new Date().toLocaleDateString()],
          [''],
          ['Role', 'Count', 'Percentage'],
          ...Object.entries(
            (data.users || []).reduce((acc: any, user: any) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {})
          ).map(([role, count]: [string, any]) => [
            role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            count,
            `${Math.round((count / (data.users?.length || 1)) * 100)}%`
          ])
        ].map(row => row.join(',')).join('\n');
        break;

      case 'financial_summary':
        const totalRevenue = (data.billing || []).reduce((sum: number, record: any) => sum + (record.amount || 0), 0);
        csvContent = [
          ['Financial Summary Report', ''],
          ['Generated', new Date().toLocaleDateString()],
          [''],
          ['Metric', 'Value'],
          ['Total Revenue', `KES ${totalRevenue.toLocaleString()}`],
          ['Total Invoices', (data.billing || []).length],
          ['Pending Invoices', (data.billing || []).filter((b: any) => b.status === 'pending').length],
          ['Paid Invoices', (data.billing || []).filter((b: any) => b.status === 'paid').length],
          [''],
          ['Recent Transactions', ''],
          ['Date', 'School', 'Amount', 'Status'],
          ...(data.billing || []).slice(0, 10).map((record: any) => [
            new Date(record.created_at).toLocaleDateString(),
            data.schools?.find((s: any) => s.id === record.school_id)?.name || 'Unknown',
            `KES ${record.amount}`,
            record.status
          ])
        ].map(row => row.join(',')).join('\n');
        break;

      default:
        csvContent = [
          [`${reportConfig?.title || 'System Report'}`, ''],
          ['Generated', new Date().toLocaleDateString()],
          [''],
          ['Report Type', reportType],
          ['Status', 'Generated Successfully']
        ].map(row => row.join(',')).join('\n');
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduFam-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFReport = (reportType: string, data: any) => {
    // For PDF, we'll create an HTML content and convert it
    const reportConfig = reportConfigs.find(config => config.type === reportType);
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportConfig?.title || 'EduFam Report'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .report-title { font-size: 20px; margin: 10px 0; }
          .report-meta { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .metric { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .metric-label { font-weight: bold; color: #334155; }
          .metric-value { font-size: 18px; color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">EduFam Platform</div>
          <div class="report-title">${reportConfig?.title || 'System Report'}</div>
          <div class="report-meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        </div>
    `;

    switch (reportType) {
      case 'school_overview':
        htmlContent += `
          <div class="metric">
            <div class="metric-label">Total Schools</div>
            <div class="metric-value">${(data.schools || []).length}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Students</div>
            <div class="metric-value">${(data.students || []).length}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Staff</div>
            <div class="metric-value">${(data.users || []).filter((u: any) => u.role !== 'parent').length}</div>
          </div>
          <table>
            <thead>
              <tr><th>School Name</th><th>Students</th><th>Staff</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${(data.schools || []).map((school: any) => `
                <tr>
                  <td>${school.name}</td>
                  <td>${(data.students || []).filter((s: any) => s.school_id === school.id).length}</td>
                  <td>${(data.users || []).filter((u: any) => u.school_id === school.id && u.role !== 'parent').length}</td>
                  <td>${school.status || 'active'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case 'user_analytics':
        const roleStats = (data.users || []).reduce((acc: any, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        htmlContent += `
          <div class="metric">
            <div class="metric-label">Total Users</div>
            <div class="metric-value">${(data.users || []).length}</div>
          </div>
          <table>
            <thead>
              <tr><th>Role</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${Object.entries(roleStats).map(([role, count]: [string, any]) => `
                <tr>
                  <td>${role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
                  <td>${count}</td>
                  <td>${Math.round((count / (data.users?.length || 1)) * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case 'financial_summary':
        const totalRevenue = (data.billing || []).reduce((sum: number, record: any) => sum + (record.amount || 0), 0);
        htmlContent += `
          <div class="metric">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">KES ${totalRevenue.toLocaleString()}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Invoices</div>
            <div class="metric-value">${(data.billing || []).length}</div>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>School</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${(data.billing || []).slice(0, 20).map((record: any) => `
                <tr>
                  <td>${new Date(record.created_at).toLocaleDateString()}</td>
                  <td>${data.schools?.find((s: any) => s.id === record.school_id)?.name || 'Unknown'}</td>
                  <td>KES ${record.amount?.toLocaleString() || 0}</td>
                  <td>${record.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      default:
        htmlContent += `
          <div class="metric">
            <div class="metric-label">Report Type</div>
            <div class="metric-value">${reportType}</div>
          </div>
          <p>Report generated successfully with available data.</p>
        `;
    }

    htmlContent += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
          <small>Generated by EduFam Platform - ${new Date().toISOString()}</small>
        </div>
      </body>
      </html>
    `;

    // Create and download HTML file (which can be saved as PDF by the user)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduFam-${reportType}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSchools();
  }, [user]);

  useEffect(() => {
    // Set default date range
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateRange({
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, []);

  if (!user || user.role !== 'edufam_admin') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access report generation.
        </AlertDescription>
      </Alert>
    );
  }

  // Debug logging to help identify issues
  console.log('🔧 EduFamReportGeneration: Component rendered for user:', user.email, 'Role:', user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Report Generation</h2>
          <p className="text-muted-foreground">Generate comprehensive reports for system analysis</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure report parameters and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school-select">School (Optional)</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportConfigs.map((config) => (
                    <SelectItem key={config.type} value={config.type}>
                      {config.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportConfigs.map((config) => (
          <Card key={config.type} className={selectedReportType === config.type ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <config.icon className="h-6 w-6" />
                {config.title}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={() => generateReport(config.type, 'pdf')}
                  disabled={loading || !selectedReportType || selectedReportType !== config.type}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'PDF'}
                </Button>
                <Button
                  onClick={() => generateReport(config.type, 'excel')}
                  disabled={loading || !selectedReportType || selectedReportType !== config.type}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Excel'}
                </Button>
              </div>
              {selectedReportType !== config.type && (
                <p className="text-xs text-muted-foreground mt-2">
                  Select this report type above to generate
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EduFamReportGeneration;
