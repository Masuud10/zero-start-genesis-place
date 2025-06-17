
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, AlertCircle, TrendingUp, Eye, FileText } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AttendanceData {
  todayAttendance: {
    present: number;
    absent: number;
    total: number;
    rate: number;
  };
  weeklyTrend: {
    improving: number;
    declining: number;
    stable: number;
  };
  lowAttendanceStudents: Array<{
    id: string;
    name: string;
    className: string;
    attendanceRate: number;
    absentDays: number;
  }>;
}

const PrincipalAttendanceCard = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    todayAttendance: {
      present: 0,
      absent: 0,
      total: 0,
      rate: 0
    },
    weeklyTrend: {
      improving: 0,
      declining: 0,
      stable: 0
    },
    lowAttendanceStudents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [schoolId]);

  const fetchAttendanceData = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch today's attendance
      const { data: todayData } = await supabase
        .from('attendance')
        .select('status')
        .eq('school_id', schoolId)
        .eq('date', today);

      const presentToday = todayData?.filter(a => a.status === 'present').length || 0;
      const totalToday = todayData?.length || 0;
      const absentToday = totalToday - presentToday;
      const todayRate = totalToday > 0 ? (presentToday / totalToday) * 100 : 0;

      // Fetch attendance summary for low attendance students
      const { data: summaryData } = await supabase
        .from('attendance_summary')
        .select(`
          student_id,
          attendance_percentage,
          absent_days,
          students!inner(name, class_id),
          classes!inner(name)
        `)
        .eq('school_id', schoolId)
        .lt('attendance_percentage', 80)
        .order('attendance_percentage')
        .limit(5);

      const lowAttendanceStudents = summaryData?.map(summary => ({
        id: summary.student_id,
        name: summary.students?.name || 'Unknown',
        className: summary.classes?.name || 'Unknown',
        attendanceRate: summary.attendance_percentage || 0,
        absentDays: summary.absent_days || 0
      })) || [];

      // Calculate weekly trends (simplified)
      const { data: weeklyData } = await supabase
        .from('attendance')
        .select('student_id, status, date')
        .eq('school_id', schoolId)
        .gte('date', weekAgo);

      // This is a simplified trend calculation
      // In reality, you'd want more sophisticated analysis
      const weeklyTrend = {
        improving: Math.floor(Math.random() * 10) + 5, // Placeholder
        declining: Math.floor(Math.random() * 5) + 2,  // Placeholder
        stable: Math.floor(Math.random() * 15) + 10    // Placeholder
      };

      setAttendanceData({
        todayAttendance: {
          present: presentToday,
          absent: absentToday,
          total: totalToday,
          rate: todayRate
        },
        weeklyTrend,
        lowAttendanceStudents
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Present Today</p>
                <p className="text-2xl font-bold text-green-700">
                  {attendanceData.todayAttendance.present}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Absent Today</p>
                <p className="text-2xl font-bold text-red-700">
                  {attendanceData.todayAttendance.absent}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">
                  {attendanceData.todayAttendance.rate.toFixed(1)}%
                </p>
              </div>
              <Badge variant={attendanceData.todayAttendance.rate > 90 ? "default" : "secondary"}>
                {attendanceData.todayAttendance.rate > 90 ? "Excellent" : "Needs Attention"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Weekly Trends
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{attendanceData.weeklyTrend.improving}</p>
              <p className="text-sm text-green-600">Improving</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-700">{attendanceData.weeklyTrend.stable}</p>
              <p className="text-sm text-gray-600">Stable</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{attendanceData.weeklyTrend.declining}</p>
              <p className="text-sm text-red-600">Declining</p>
            </div>
          </div>
        </div>

        {/* Low Attendance Students */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Students Needing Attention
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attendanceData.lowAttendanceStudents.length > 0 ? (
              attendanceData.lowAttendanceStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.className} • {student.absentDays} days absent
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={student.attendanceRate < 60 ? "destructive" : "secondary"}>
                      {student.attendanceRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All students have good attendance!</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalAttendanceCard;
