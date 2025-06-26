
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpen, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface ClassAnalyticsData {
  classPerformance: Array<{
    className: string;
    averageGrade: number;
    studentCount: number;
    attendanceRate: number;
  }>;
  attendanceTrend: Array<{
    date: string;
    rate: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
}

const ClassAnalyticsOverview: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['teacher-class-analytics', user?.id, schoolId],
    queryFn: async (): Promise<ClassAnalyticsData> => {
      if (!user?.id || !schoolId) {
        throw new Error('User ID and School ID are required');
      }

      // Get teacher's classes
      const { data: teacherClasses } = await supabase
        .from('teacher_classes')
        .select(`
          class_id,
          classes!inner(id, name)
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId);

      const classIds = teacherClasses?.map(tc => tc.class_id) || [];

      // Get class performance data
      const classPerformance = [];
      for (const classItem of teacherClasses || []) {
        // Get average grades for this class
        const { data: grades } = await supabase
          .from('grades')
          .select('percentage')
          .eq('class_id', classItem.class_id)
          .eq('school_id', schoolId)
          .eq('status', 'approved')
          .not('percentage', 'is', null);

        // Get student count
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classItem.class_id)
          .eq('is_active', true);

        // Get attendance rate for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: attendance } = await supabase
          .from('attendance')
          .select('status')
          .eq('class_id', classItem.class_id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .eq('school_id', schoolId);

        const attendanceRate = attendance && attendance.length > 0 
          ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
          : 0;

        const averageGrade = grades && grades.length > 0
          ? Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)
          : 0;

        classPerformance.push({
          className: classItem.classes?.name || 'Unknown',
          averageGrade,
          studentCount: studentCount || 0,
          attendanceRate
        });
      }

      // Get attendance trend for last 7 days
      const attendanceTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const { data: dayAttendance } = await supabase
          .from('attendance')
          .select('status')
          .in('class_id', classIds)
          .eq('date', dateStr)
          .eq('school_id', schoolId);

        const rate = dayAttendance && dayAttendance.length > 0
          ? Math.round((dayAttendance.filter(a => a.status === 'present').length / dayAttendance.length) * 100)
          : 0;

        attendanceTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate
        });
      }

      // Get grade distribution
      const { data: allGrades } = await supabase
        .from('grades')
        .select('letter_grade')
        .in('class_id', classIds)
        .eq('school_id', schoolId)
        .eq('status', 'approved')
        .not('letter_grade', 'is', null);

      const gradeCounts: { [key: string]: number } = {};
      allGrades?.forEach(g => {
        if (g.letter_grade) {
          gradeCounts[g.letter_grade] = (gradeCounts[g.letter_grade] || 0) + 1;
        }
      });

      const totalGrades = Object.values(gradeCounts).reduce((sum, count) => sum + count, 0);
      const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({
        grade,
        count,
        percentage: totalGrades > 0 ? Math.round((count / totalGrades) * 100) : 0
      }));

      return {
        classPerformance,
        attendanceTrend,
        gradeDistribution
      };
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000,
  });

  const chartConfig = {
    averageGrade: { label: 'Average Grade', color: '#3b82f6' },
    attendanceRate: { label: 'Attendance Rate', color: '#10b981' },
    rate: { label: 'Attendance Rate', color: '#8b5cf6' },
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Unable to load analytics data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Performance Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Class Performance
              </h3>
              {analyticsData.classPerformance.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={analyticsData.classPerformance}>
                    <XAxis dataKey="className" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="averageGrade" fill="var(--color-averageGrade)" name="Average Grade %" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No performance data available
                </div>
              )}
            </div>

            {/* Attendance Trend Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance Trends (7 Days)
              </h3>
              {analyticsData.attendanceTrend.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <LineChart data={analyticsData.attendanceTrend}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="var(--color-rate)" 
                      strokeWidth={2}
                      name="Attendance Rate %"
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No attendance data available
                </div>
              )}
            </div>
          </div>

          {/* Grade Distribution and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Grade Distribution Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Grade Distribution
              </h3>
              {analyticsData.gradeDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No grade distribution data available
                </div>
              )}
            </div>

            {/* Quick Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Performance Summary
              </h3>
              <div className="space-y-4">
                {analyticsData.classPerformance.map((classData, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{classData.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {classData.studentCount} students
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {classData.averageGrade}% avg
                        </Badge>
                        <Badge 
                          variant={classData.attendanceRate >= 90 ? "default" : 
                                  classData.attendanceRate >= 80 ? "secondary" : "destructive"}
                        >
                          {classData.attendanceRate}% attendance
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassAnalyticsOverview;
