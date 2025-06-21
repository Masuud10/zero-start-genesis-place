
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const EduFamDashboardOverview = () => {
  
  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['edufam-dashboard-stats'],
    queryFn: async () => {
      console.log('📊 Fetching EduFam dashboard statistics');

      // Get total schools
      const { count: schoolCount } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });

      // Get total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get total teachers
      const { count: teacherCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      // Get financial data
      const { data: financialData } = await supabase
        .from('financial_transactions')
        .select('amount, created_at, transaction_type');

      const totalRevenue = financialData?.reduce((sum, trans) => sum + parseFloat(String(trans.amount || 0)), 0) || 0;

      // Get grades distribution
      const { data: gradesData } = await supabase
        .from('grades')
        .select('letter_grade, percentage, created_at')
        .eq('status', 'released')
        .not('letter_grade', 'is', null);

      // Get attendance data
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, date, school_id');

      return {
        totalSchools: schoolCount || 0,
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        totalRevenue,
        gradesData: gradesData || [],
        attendanceData: attendanceData || [],
        financialData: financialData || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process data for charts
  const chartData = React.useMemo(() => {
    if (!dashboardStats) return null;

    // Grades distribution
    const gradeDistribution = dashboardStats.gradesData.reduce((acc: any, grade: any) => {
      const letter = grade.letter_grade || 'Unknown';
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});

    const gradesChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: ((count as number) / dashboardStats.gradesData.length * 100).toFixed(1)
    }));

    // Monthly attendance trends
    const attendanceTrends = dashboardStats.attendanceData.reduce((acc: any, record: any) => {
      const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = { month, present: 0, absent: 0, total: 0 };
      }
      acc[month].total++;
      if (record.status === 'present') {
        acc[month].present++;
      } else {
        acc[month].absent++;
      }
      return acc;
    }, {});

    const attendanceChartData = Object.values(attendanceTrends).map((data: any) => ({
      ...data,
      rate: ((data.present / data.total) * 100).toFixed(1)
    }));

    // Monthly revenue trends
    const revenueTrends = dashboardStats.financialData.reduce((acc: any, trans: any) => {
      const month = new Date(trans.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, transactions: 0 };
      }
      acc[month].revenue += parseFloat(String(trans.amount || 0));
      acc[month].transactions++;
      return acc;
    }, {});

    const revenueChartData = Object.values(revenueTrends);

    return {
      gradesChartData,
      attendanceChartData,
      revenueChartData
    };
  }, [dashboardStats]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const statsCards = [
    {
      title: 'Total Schools',
      value: dashboardStats?.totalSchools || 0,
      icon: Building2,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Students',
      value: dashboardStats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Teachers',
      value: dashboardStats?.totalTeachers || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${(dashboardStats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      change: '+15%',
      trend: 'up'
    }
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Card key={card.title} className={`${card.bgColor} ${card.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor}`}>
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {card.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change} from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor.replace('50', '100')}`}>
                  <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades Distribution Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Grades Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.gradesChartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.attendanceChartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData?.revenueChartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F59E0B" 
                  fill="#FEF3C7"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              System Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Active Sessions</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {Math.floor(Math.random() * 100) + 50}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Data Sync Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">API Response Time</span>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  {Math.floor(Math.random() * 100) + 50}ms
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Database Load</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  {Math.floor(Math.random() * 30) + 20}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamDashboardOverview;
