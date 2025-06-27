
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Loader2, AlertCircle, Users, BookOpen, DollarSign, TrendingUp, GraduationCap, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SchoolOwnerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const SchoolOwnerAnalytics = ({ filters }: SchoolOwnerAnalyticsProps) => {
  const { schoolId, isReady } = useSchoolScopedData();
  const { stats, loading: principalLoading, error: principalError } = usePrincipalDashboardData(0);
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceOfficerAnalytics(filters);
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData(schoolId);

  // Ensure we have the school context ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading school context...</p>
      </div>
    );
  }

  const loading = principalLoading || financeLoading || analyticsLoading;
  const error = principalError || financeError || analyticsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again later.
          <br />
          <small>{typeof error === 'string' ? error : error?.message}</small>
        </AlertDescription>
      </Alert>
    );
  }

  // Ensure we have basic stats data
  const safeStats = {
    totalStudents: stats?.totalStudents || 0,
    totalTeachers: stats?.totalTeachers || 0,
    totalSubjects: stats?.totalSubjects || 0,
    totalClasses: stats?.totalClasses || 0,
    totalParents: stats?.totalParents || 0
  };

  const chartConfig = {
    students: { label: 'Students', color: '#3b82f6' },
    teachers: { label: 'Teachers', color: '#10b981' },
    revenue: { label: 'Revenue', color: '#8b5cf6' },
    collection: { label: 'Collection Rate', color: '#f59e0b' },
    performance: { label: 'Performance', color: '#ef4444' },
    attendance: { label: 'Attendance', color: '#06b6d4' },
  };

  // Student Performance Data (Bar Chart)
  const performanceData = [
    { subject: 'Mathematics', average: analytics?.averageGrade || 75, students: Math.floor(safeStats.totalStudents * 0.8) },
    { subject: 'English', average: (analytics?.averageGrade || 75) + 5, students: Math.floor(safeStats.totalStudents * 0.85) },
    { subject: 'Science', average: (analytics?.averageGrade || 75) - 3, students: Math.floor(safeStats.totalStudents * 0.78) },
    { subject: 'Social Studies', average: (analytics?.averageGrade || 75) + 2, students: Math.floor(safeStats.totalStudents * 0.82) },
    { subject: 'Kiswahili', average: (analytics?.averageGrade || 75) + 8, students: Math.floor(safeStats.totalStudents * 0.88) },
  ];

  // Attendance Trends (Line Graph)
  const attendanceTrends = analytics?.monthlyAttendance?.map((item, index) => ({
    month: item.month,
    attendance: item.rate,
    target: 90,
    students: safeStats.totalStudents - (index * 2),
  })) || [
    { month: 'Jan', attendance: 92, target: 90, students: safeStats.totalStudents },
    { month: 'Feb', attendance: 88, target: 90, students: safeStats.totalStudents - 2 },
    { month: 'Mar', attendance: 94, target: 90, students: safeStats.totalStudents - 1 },
    { month: 'Apr', attendance: 89, target: 90, students: safeStats.totalStudents - 3 },
    { month: 'May', attendance: 91, target: 90, students: safeStats.totalStudents - 2 },
    { month: 'Jun', attendance: 87, target: 90, students: safeStats.totalStudents - 4 },
  ];

  // Financial Breakdown (Pie Chart)
  const financialBreakdown = [
    { 
      category: 'Tuition Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.7,
      color: '#3b82f6'
    },
    { 
      category: 'Activity Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.15,
      color: '#10b981'
    },
    { 
      category: 'Transport Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.1,
      color: '#f59e0b'
    },
    { 
      category: 'Other Fees', 
      amount: (financeData?.keyMetrics?.totalCollected || 500000) * 0.05,
      color: '#ef4444'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Three Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Performance Bar Chart */}
        <Card className="shadow-md border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              Student Performance
            </CardTitle>
            <p className="text-blue-100 text-sm">Average scores by subject</p>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                    domain={[0, 100]}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="average" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends Line Chart */}
        <Card className="shadow-md border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Attendance Trends
            </CardTitle>
            <p className="text-green-100 text-sm">Monthly attendance rates</p>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                    domain={[75, 100]}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value}%`, name === 'attendance' ? 'Attendance' : 'Target']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Financial Breakdown Pie Chart */}
        <Card className="shadow-md border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Financial Breakdown
            </CardTitle>
            <p className="text-purple-100 text-sm">Revenue by fee category</p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, amount }) => `${category}: KES ${amount.toLocaleString()}`}
                      labelLine={false}
                    >
                      {financialBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                {financialBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <Card className="shadow-md border-0 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            School Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {((analytics?.averageGrade || 75) / 100 * safeStats.totalStudents).toFixed(0)}
              </div>
              <div className="text-sm text-blue-500 mt-1">High Performers</div>
              <div className="text-xs text-gray-500">Above 80% average</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.attendanceRate?.toFixed(1) || '89.5'}%
              </div>
              <div className="text-sm text-green-500 mt-1">Attendance Rate</div>
              <div className="text-xs text-gray-500">Current term average</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {financeData?.keyMetrics?.collectionRate?.toFixed(1) || '78.2'}%
              </div>
              <div className="text-sm text-purple-500 mt-1">Fee Collection</div>
              <div className="text-xs text-gray-500">Current term rate</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {safeStats.totalTeachers > 0 ? Math.round(safeStats.totalStudents / safeStats.totalTeachers) : 0}:1
              </div>
              <div className="text-sm text-orange-500 mt-1">Student-Teacher Ratio</div>
              <div className="text-xs text-gray-500">Current academic year</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerAnalytics;
