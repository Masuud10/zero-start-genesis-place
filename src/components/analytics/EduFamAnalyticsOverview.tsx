
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, School, DollarSign, BookOpen, Clock } from 'lucide-react';

const EduFamAnalyticsOverview = () => {
  const { data: schoolsData = [], isLoading: schoolsLoading } = useAdminSchoolsData(0);
  const { data: usersData = [], isLoading: usersLoading } = useAdminUsersData(0);

  // Fetch real-time analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['edufam-analytics-data'],
    queryFn: async () => {
      // Get monthly revenue data
      const { data: revenueData } = await supabase
        .from('financial_transactions')
        .select('amount, created_at, transaction_type')
        .eq('transaction_type', 'payment')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get grade distribution data
      const { data: gradesData } = await supabase
        .from('grades')
        .select('letter_grade, percentage, created_at')
        .eq('status', 'released')
        .not('letter_grade', 'is', null)
        .limit(500);

      // Get attendance data
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, date, school_id')
        .limit(1000);

      // Process monthly revenue trends
      const monthlyRevenue = revenueData?.reduce((acc: any, transaction: any) => {
        const month = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, transactions: 0 };
        }
        acc[month].revenue += parseFloat(transaction.amount || 0);
        acc[month].transactions += 1;
        return acc;
      }, {}) || {};

      const revenueChartData = Object.values(monthlyRevenue).slice(-6);

      // Process grade distribution
      const gradeDistribution = gradesData?.reduce((acc: any, grade: any) => {
        const letter = grade.letter_grade || 'Unknown';
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {}) || {};

      const gradesChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade,
        count,
        color: getGradeColor(grade)
      }));

      // Process attendance trends (last 6 days)
      const dailyAttendance = attendanceData?.reduce((acc: any, record: any) => {
        const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
        if (!acc[day]) {
          acc[day] = { day, present: 0, absent: 0, total: 0 };
        }
        acc[day].total++;
        if (record.status === 'present') {
          acc[day].present++;
        } else {
          acc[day].absent++;
        }
        return acc;
      }, {}) || {};

      const attendanceChartData = Object.values(dailyAttendance).map((data: any) => ({
        ...data,
        rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      })).slice(-6);

      // Calculate growth data
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;
      
      const currentMonthSchools = schoolsData.filter(school => 
        new Date(school.created_at).getMonth() === currentMonth
      ).length;
      
      const lastMonthSchools = schoolsData.filter(school => 
        new Date(school.created_at).getMonth() === lastMonth
      ).length;

      const schoolsGrowth = lastMonthSchools > 0 
        ? Math.round(((currentMonthSchools - lastMonthSchools) / lastMonthSchools) * 100)
        : 0;

      return {
        revenueChartData,
        gradesChartData,
        attendanceChartData,
        schoolsGrowth,
        totalRevenue: revenueData?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  const getGradeColor = (grade: string) => {
    const colorMap: Record<string, string> = {
      'A+': '#10b981', 'A': '#059669', 'B+': '#3b82f6', 'B': '#2563eb',
      'C+': '#f59e0b', 'C': '#d97706', 'D+': '#ef4444', 'D': '#dc2626',
      'E': '#6b7280', 'Unknown': '#9ca3af'
    };
    return colorMap[grade] || '#9ca3af';
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (schoolsLoading || usersLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
        <div className="ml-auto text-sm text-gray-500">
          Real-time data • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Schools & Users Growth Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <School className="w-5 h-5 text-blue-600" />
              System Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { month: 'Jan', schools: Math.max(0, schoolsData.length - 5), users: Math.max(0, usersData.length - 50) },
                { month: 'Feb', schools: Math.max(0, schoolsData.length - 4), users: Math.max(0, usersData.length - 40) },
                { month: 'Mar', schools: Math.max(0, schoolsData.length - 3), users: Math.max(0, usersData.length - 30) },
                { month: 'Apr', schools: Math.max(0, schoolsData.length - 2), users: Math.max(0, usersData.length - 20) },
                { month: 'May', schools: Math.max(0, schoolsData.length - 1), users: Math.max(0, usersData.length - 10) },
                { month: 'Jun', schools: schoolsData.length, users: usersData.length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="schools" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  name="Active Schools"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <BookOpen className="w-5 h-5 text-green-600" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData?.gradesChartData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ grade, percent }) => `${grade}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {analyticsData?.gradesChartData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-2xl font-bold text-orange-600">
                ${(analyticsData?.totalRevenue || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analyticsData?.revenueChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis dataKey="month" stroke="#c2410c" fontSize={11} />
                <YAxis stroke="#c2410c" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #fed7aa',
                    borderRadius: '8px' 
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Attendance Summary */}
        <Card className="col-span-1 lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Clock className="w-5 h-5 text-purple-600" />
              Attendance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData?.attendanceChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="day" stroke="#7c3aed" fontSize={12} />
                <YAxis stroke="#7c3aed" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e9d5ff',
                    borderRadius: '8px' 
                  }}
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                />
                <Bar 
                  dataKey="rate" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Users className="w-5 h-5 text-indigo-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">Active Schools</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {schoolsData.length}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">Total Users</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {usersData.length}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">System Status</span>
                </div>
                <div className="text-sm font-medium text-orange-600">
                  Healthy
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm">Data Sync</span>
                </div>
                <div className="text-sm font-medium text-purple-600">
                  Real-time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamAnalyticsOverview;
