import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, AlertTriangle, BarChart3, Building2, Users, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemReportData {
  totalSchools: number;
  activeUsers: number;
  totalRevenue: number;
  avgPerformance: number;
  topSchools: any[];
  userRoleBreakdown: any[];
  recentActivity: any[];
}

const SystemReportsModule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SystemReportData | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const reportTypes = [
    { value: 'overview', label: 'System Overview', icon: BarChart3 },
    { value: 'schools', label: 'Schools Analysis', icon: Building2 },
    { value: 'users', label: 'User Analytics', icon: Users },
    { value: 'financial', label: 'Financial Summary', icon: DollarSign }
  ];

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch schools data
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) throw schoolsError;

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;

      // Fetch billing data
      const { data: billing, error: billingError } = await supabase
        .from('school_billing_records')
        .select('*');
      
      if (billingError) throw billingError;

      // Process data
      const totalRevenue = billing?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      const userRoleBreakdown = users?.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      setReportData({
        totalSchools: schools?.length || 0,
        activeUsers: users?.length || 0,
        totalRevenue,
        avgPerformance: 92.5, // Mock performance metric
        topSchools: schools?.slice(0, 5) || [],
        userRoleBreakdown: Object.entries(userRoleBreakdown).map(([role, count]) => ({ role, count })),
        recentActivity: []
      });

    } catch (error: any) {
      console.error('Error fetching system data:', error);
      toast({
        title: "Error",
        description: "Failed to load system data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    if (!reportData) {
      toast({
        title: "No Data",
        description: "Please load system data first",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      let content = '';
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'excel') {
        // Generate CSV format
        content = [
          ['EduFam System Report', ''],
          ['Generated', new Date().toLocaleDateString()],
          ['Report Type', selectedReportType],
          [''],
          ['Metric', 'Value'],
          ['Total Schools', reportData.totalSchools],
          ['Active Users', reportData.activeUsers],
          ['Total Revenue', `KES ${reportData.totalRevenue.toLocaleString()}`],
          ['System Performance', `${reportData.avgPerformance}%`],
          [''],
          ['User Role Breakdown', ''],
          ['Role', 'Count'],
          ...reportData.userRoleBreakdown.map(item => [
            item.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            item.count
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduFam-system-report-${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Generate HTML for PDF
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>EduFam System Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
              .logo { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
              .report-title { font-size: 22px; margin: 10px 0; color: #1f2937; }
              .report-meta { color: #6b7280; margin-bottom: 20px; }
              .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
              .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
              .metric-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
              .metric-label { font-size: 14px; color: #64748b; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
              th { background: #f1f5f9; font-weight: bold; color: #1e293b; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🎓 EduFam Platform</div>
              <div class="report-title">System Performance Report</div>
              <div class="report-meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
            </div>

            <div class="metrics">
              <div class="metric">
                <div class="metric-value">${reportData.totalSchools}</div>
                <div class="metric-label">Total Schools</div>
              </div>
              <div class="metric">
                <div class="metric-value">${reportData.activeUsers}</div>
                <div class="metric-label">Active Users</div>
              </div>
              <div class="metric">
                <div class="metric-value">KES ${reportData.totalRevenue.toLocaleString()}</div>
                <div class="metric-label">Total Revenue</div>
              </div>
              <div class="metric">
                <div class="metric-value">${reportData.avgPerformance}%</div>
                <div class="metric-label">System Performance</div>
              </div>
            </div>

            <h3>User Role Distribution</h3>
            <table>
              <thead>
                <tr><th>Role</th><th>Count</th><th>Percentage</th></tr>
              </thead>
              <tbody>
                ${reportData.userRoleBreakdown.map(item => `
                  <tr>
                    <td>${item.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
                    <td>${item.count}</td>
                    <td>${Math.round((item.count / reportData.activeUsers) * 100)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p><strong>Powered by EduFam Platform</strong></p>
              <p>Generated on ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `;

        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduFam-system-report-${timestamp}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Report Generated",
        description: `System report downloaded successfully as ${format.toUpperCase()}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  useEffect(() => {
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
          Access denied. Only EduFam Administrators can access system reports.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Reports</h2>
          <p className="text-muted-foreground">Generate comprehensive system-wide reports and analytics</p>
        </div>
        <Button onClick={fetchSystemData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* System Overview Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Schools</p>
                  <p className="text-2xl font-bold">{reportData.totalSchools}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{reportData.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">KES {reportData.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-2xl font-bold">{reportData.avgPerformance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure and generate system reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => generateReport('pdf')} 
              disabled={loading || !reportData}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
            <Button 
              onClick={() => generateReport('excel')} 
              disabled={loading || !reportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Role Breakdown */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.userRoleBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {item.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{item.count}</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((item.count / reportData.activeUsers) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemReportsModule;