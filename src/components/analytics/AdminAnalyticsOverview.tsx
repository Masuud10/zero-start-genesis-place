
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  DollarSign,
  Award,
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
  Cell
} from 'recharts';

const AdminAnalyticsOverview = () => {
  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: async () => {
      console.log('📊 Fetching Admin Analytics Overview');

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

      // Get financial transactions
      const { data: financialData } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_type, created_at');

      const totalTransactions = financialData?.length || 0;
      const totalCollected = financialData?.reduce((sum, trans) => sum + parseFloat(String(trans.amount || 0)), 0) || 0;

      // Get pending fees
      const { data: feesData } = await supabase
        .from('fees')
        .select('amount, paid_amount, status');

      const totalPendingFees = feesData?.reduce((sum, fee) => 
        sum + (parseFloat(String(fee.amount || 0)) - parseFloat(String(fee.paid_amount || 0))), 0) || 0;

      // Get certificates count
      const { count: certificateCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true });

      // Get grades distribution
      const { data: gradesData } = await supabase
        .from('grades')
        .select('letter_grade, percentage')
        .eq('status', 'released')
        .not('letter_grade', 'is', null);

      // Process grade distribution
      const gradeDistribution = gradesData?.reduce((acc: any, grade) => {
        const letter = grade.letter_grade || 'Unknown';
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {}) || {};

      const gradeChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade,
        count,
        percentage: ((count as number) / (gradesData?.length || 1) * 100).toFixed(1)
      }));

      // Monthly transaction trends
      const monthlyData = financialData?.reduce((acc: any, trans) => {
        const month = new Date(trans.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, amount: 0, transactions: 0 };
        }
        acc[month].amount += parseFloat(String(trans.amount || 0));
        acc[month].transactions++;
        return acc;
      }, {}) || {};

      const monthlyChartData = Object.values(monthlyData).slice(-6); // Last 6 months

      // School growth data
      const { data: schoolsGrowthData } = await supabase
        .from('schools')
        .select('created_at')
        .order('created_at', { ascending: true });

      const schoolGrowthData = schoolsGrowthData?.reduce((acc: any, school) => {
        const month = new Date(school.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {}) || {};

      const schoolGrowthChartData = Object.entries(schoolGrowthData).map(([month, count]) => ({
        month,
        schools: count
      }));

      return {
        totalSchools: schoolCount || 0,
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        totalTransactions,
        totalCollected,
        totalPendingFees,
        totalCertificates: certificateCount || 0,
        gradeChartData,
        monthlyChartData,
        schoolGrowthChartData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-blue-200 rounded mb-2"></div>
              <div className="h-4 bg-blue-200 rounded w-2/3"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <p className="text-blue-700 text-sm font-normal mt-1">
                Comprehensive insights and performance metrics across all schools
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Pie Chart */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.gradeChartData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analyticsData?.gradeChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Financial Trends */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Monthly Financial Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.monthlyChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `$${Number(value).toLocaleString()}` : value,
                    name === 'amount' ? 'Revenue' : 'Transactions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#F97316" 
                  strokeWidth={3}
                  dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* School Growth Chart */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Building2 className="h-5 w-5 text-purple-600" />
              School Onboarding Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.schoolGrowthChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar 
                  dataKey="schools" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Award className="h-5 w-5 text-slate-600" />
              Key Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Total Schools</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">
                  {analyticsData?.totalSchools || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Total Students</span>
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {analyticsData?.totalStudents || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Total Teachers</span>
                </div>
                <span className="text-2xl font-bold text-purple-700">
                  {analyticsData?.totalTeachers || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Revenue Collected</span>
                </div>
                <span className="text-2xl font-bold text-orange-700">
                  ${(analyticsData?.totalCollected || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-900">Certificates Generated</span>
                </div>
                <span className="text-2xl font-bold text-amber-700">
                  {analyticsData?.totalCertificates || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
