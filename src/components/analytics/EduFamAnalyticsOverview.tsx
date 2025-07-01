
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Building2, DollarSign, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
  totalSchools: number;
  totalUsers: number;
  monthlyGrowth: number;
  revenueGrowth: number;
  schoolGrowthData: Array<{ month: string; schools: number; users: number }>;
  userRoleData: Array<{ role: string; count: number; color: string }>;
  systemHealthData: Array<{ metric: string; value: number; status: string }>;
}

interface EduFamAnalyticsOverviewProps {
  onAnalyticsAction?: (action: string) => void;
}

const EduFamAnalyticsOverview: React.FC<EduFamAnalyticsOverviewProps> = ({ onAnalyticsAction }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access system analytics.');
      }

      // Fetch schools data
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, created_at, status')
        .order('created_at', { ascending: false });

      if (schoolsError) throw schoolsError;

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, role, created_at, school_id')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Process data for analytics
      const currentDate = new Date();
      const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);

      // Generate monthly growth data
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        
        const schoolsInMonth = schoolsData?.filter(s => 
          new Date(s.created_at) <= monthDate
        ).length || 0;
        
        const usersInMonth = usersData?.filter(u => 
          new Date(u.created_at) <= monthDate
        ).length || 0;

        monthlyData.push({
          month: monthName,
          schools: schoolsInMonth,
          users: usersInMonth
        });
      }

      // User role distribution
      const roleDistribution = usersData?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const roleColors = {
        'edufam_admin': '#3b82f6',
        'school_owner': '#10b981',
        'principal': '#f59e0b',
        'teacher': '#06b6d4',
        'finance_officer': '#8b5cf6',
        'parent': '#ec4899'
      };

      const userRoleData = Object.entries(roleDistribution).map(([role, count]) => ({
        role: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        color: roleColors[role as keyof typeof roleColors] || '#6b7280'
      }));

      // System health metrics (mock data for demonstration)
      const systemHealthData = [
        { metric: 'Database Performance', value: 95, status: 'good' },
        { metric: 'API Response Time', value: 87, status: 'good' },
        { metric: 'User Satisfaction', value: 92, status: 'good' },
        { metric: 'System Uptime', value: 99, status: 'excellent' }
      ];

      // Calculate growth rates
      const currentMonthSchools = schoolsData?.filter(s => 
        new Date(s.created_at).getMonth() === currentDate.getMonth()
      ).length || 0;
      
      const lastMonthSchools = schoolsData?.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate.getMonth() === currentDate.getMonth() - 1;
      }).length || 0;

      const monthlyGrowth = lastMonthSchools > 0 
        ? Math.round(((currentMonthSchools - lastMonthSchools) / lastMonthSchools) * 100)
        : 0;

      const analyticsResult: AnalyticsData = {
        totalSchools: schoolsData?.length || 0,
        totalUsers: usersData?.length || 0,
        monthlyGrowth,
        revenueGrowth: 15, // Mock data
        schoolGrowthData: monthlyData,
        userRoleData,
        systemHealthData
      };

      setAnalyticsData(analyticsResult);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load analytics data';
      setError(errorMessage);
      console.error('🔴 EduFamAnalyticsOverview: Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = () => {
    if (onAnalyticsAction) {
      onAnalyticsAction('export-analytics');
    }
    
    // Create and download CSV
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Schools', analyticsData?.totalSchools || 0],
      ['Total Users', analyticsData?.totalUsers || 0],
      ['Monthly Growth', `${analyticsData?.monthlyGrowth || 0}%`],
      ['Revenue Growth', `${analyticsData?.revenueGrowth || 0}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduFam-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user]);

  if (!user || user.role !== 'edufam_admin') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access system analytics.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            System Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading analytics data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            System Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
              <Button
                onClick={fetchAnalyticsData}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              System Analytics Overview
            </CardTitle>
            <CardDescription>Real-time platform performance and growth metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportAnalytics} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Schools</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {analyticsData?.totalSchools || 0}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {analyticsData?.totalUsers || 0}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Monthly Growth</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {analyticsData?.monthlyGrowth || 0}%
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Revenue Growth</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {analyticsData?.revenueGrowth || 0}%
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform Growth Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData?.schoolGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="schools" stroke="#3b82f6" name="Schools" />
                <Line type="monotone" dataKey="users" stroke="#10b981" name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData?.userRoleData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ role, count }) => `${role}: ${count}`}
                >
                  {analyticsData?.userRoleData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">System Health Metrics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analyticsData?.systemHealthData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={() => onAnalyticsAction?.('view-detailed-analytics')}
            variant="default"
          >
            View Detailed Analytics
          </Button>
          <Button 
            onClick={handleExportAnalytics}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EduFamAnalyticsOverview;
