
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingCard, ErrorState } from '@/components/common/LoadingStates';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  DollarSign,
  BookOpen,
  UserCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

interface SchoolSummary {
  id: string;
  name: string;
  location: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  outstandingFees: number;
  attendanceRate: number;
  averageGrade: number;
  createdAt: string;
}

const SchoolAnalyticsDashboard = () => {
  const { data: schoolSummaries, isLoading, error } = useQuery({
    queryKey: ['school-analytics-summaries'],
    queryFn: async (): Promise<SchoolSummary[]> => {
      console.log('📊 Fetching school analytics summaries');

      // Get all schools with detailed analytics
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (schoolsError) throw schoolsError;

      const summaries = await Promise.all(
        (schools || []).map(async (school) => {
          // Get student count
          const { count: studentCount } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('is_active', true);

          // Get teacher count
          const { count: teacherCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('role', 'teacher');

          // Get class count
          const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id);

          // Get financial data
          const { data: transactions } = await supabase
            .from('financial_transactions')
            .select('amount')
            .eq('school_id', school.id);

          const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0) || 0;

          // Get outstanding fees
          const { data: fees } = await supabase
            .from('fees')
            .select('amount, paid_amount')
            .eq('school_id', school.id)
            .neq('status', 'paid');

          const outstandingFees = fees?.reduce((sum, f) => sum + (parseFloat(String(f.amount || 0)) - parseFloat(String(f.paid_amount || 0))), 0) || 0;

          // Get attendance rate
          const { data: attendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('school_id', school.id);

          const attendanceRate = attendance?.length > 0 
            ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100 
            : 0;

          // Get average grade
          const { data: grades } = await supabase
            .from('grades')
            .select('percentage')
            .eq('school_id', school.id)
            .eq('status', 'released')
            .not('percentage', 'is', null);

          const averageGrade = grades?.length > 0 
            ? grades.reduce((sum, g) => sum + parseFloat(String(g.percentage || 0)), 0) / grades.length 
            : 0;

          return {
            id: school.id,
            name: school.name,
            location: school.location || 'N/A',
            totalStudents: studentCount || 0,
            totalTeachers: teacherCount || 0,
            totalClasses: classCount || 0,
            totalRevenue,
            outstandingFees,
            attendanceRate,
            averageGrade,
            createdAt: school.created_at
          };
        })
      );

      return summaries;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard 
          title="Loading School Analytics..."
          description="Fetching real-time data for all schools"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to Load School Analytics"
          description="There was an error fetching school analytics data."
          error={error instanceof Error ? error.message : 'Unknown error occurred'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const totalStats = schoolSummaries?.reduce((acc, school) => ({
    totalSchools: acc.totalSchools + 1,
    totalStudents: acc.totalStudents + school.totalStudents,
    totalTeachers: acc.totalTeachers + school.totalTeachers,
    totalRevenue: acc.totalRevenue + school.totalRevenue,
    totalOutstanding: acc.totalOutstanding + school.outstandingFees,
  }), {
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">School Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive analytics for all onboarded schools with real-time data
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{totalStats?.totalSchools || 0}</p>
                <p className="text-sm text-blue-700">Total Schools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">{totalStats?.totalStudents || 0}</p>
                <p className="text-sm text-green-700">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{totalStats?.totalTeachers || 0}</p>
                <p className="text-sm text-purple-700">Total Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-900">${(totalStats?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-sm text-orange-700">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">${(totalStats?.totalOutstanding || 0).toLocaleString()}</p>
                <p className="text-sm text-red-700">Outstanding Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual School Summaries */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Individual School Summaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolSummaries?.map((school) => (
            <Card key={school.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="truncate">{school.name}</span>
                  </div>
                  <Badge variant="secondary">{school.location}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{school.totalStudents}</div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{school.totalTeachers}</div>
                    <div className="text-xs text-gray-600">Teachers</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{school.totalClasses}</div>
                    <div className="text-xs text-gray-600">Classes</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{school.averageGrade.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Avg Grade</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-semibold text-green-600">${school.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outstanding:</span>
                    <span className="font-semibold text-red-600">${school.outstandingFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendance:</span>
                    <span className="font-semibold text-blue-600">{school.attendanceRate.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Onboarded: {new Date(school.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolAnalyticsDashboard;
