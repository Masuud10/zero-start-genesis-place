
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

const SchoolAdminDashboard = () => {
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);

  const { data: schoolStats, isLoading } = useQuery({
    queryKey: ['school-stats', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      try {
        // Get students count
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('is_active', true);

        // Get classes count
        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId);

        // Get teachers count
        const { count: teacherCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('role', 'teacher');

        // Get subjects count
        const { count: subjectCount } = await supabase
          .from('subjects')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId);

        // Get recent attendance rate (simplified)
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('school_id', schoolId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const attendanceRate = attendanceData?.length > 0 
          ? (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100
          : 0;

        // Get outstanding fees (simplified)
        const { data: feesData } = await supabase
          .from('fees')
          .select('amount, paid_amount')
          .eq('school_id', schoolId)
          .in('status', ['pending', 'partial']);

        const outstandingFees = feesData?.reduce((sum, fee) => 
          sum + (fee.amount - (fee.paid_amount || 0)), 0) || 0;

        return {
          studentCount: studentCount || 0,
          classCount: classCount || 0,
          teacherCount: teacherCount || 0,
          subjectCount: subjectCount || 0,
          attendanceRate: Math.round(attendanceRate),
          outstandingFees
        };
      } catch (error) {
        console.error('Error fetching school stats:', error);
        return {
          studentCount: 0,
          classCount: 0,
          teacherCount: 0,
          subjectCount: 0,
          attendanceRate: 0,
          outstandingFees: 0
        };
      }
    },
    enabled: !!schoolId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">School Not Assigned</h3>
          <p className="text-muted-foreground">
            Your account is not assigned to a school. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            School Dashboard
          </h1>
          <p className="text-muted-foreground">
            Academic Year: {academicInfo.year} | Current Term: {academicInfo.term}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {academicInfo.term}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Students</p>
                <p className="text-3xl font-bold">{schoolStats?.studentCount || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Teachers</p>
                <p className="text-3xl font-bold">{schoolStats?.teacherCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Classes</p>
                <p className="text-3xl font-bold">{schoolStats?.classCount || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Attendance Rate</p>
                <p className="text-3xl font-bold">{schoolStats?.attendanceRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Subjects</span>
              <Badge variant="secondary">{schoolStats?.subjectCount || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Outstanding Fees</span>
              <Badge variant="destructive">
                ${schoolStats?.outstandingFees?.toLocaleString() || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>System Status</span>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Attendance recorded for today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>New timetable published</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Grades updated for Term {academicInfo.term}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
