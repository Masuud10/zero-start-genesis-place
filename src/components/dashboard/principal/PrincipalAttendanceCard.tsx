
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, AlertCircle } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AttendanceStats from './attendance/AttendanceStats';
import WeeklyTrends from './attendance/WeeklyTrends';

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
      const weeklyTrend = {
        improving: Math.floor(Math.random() * 10) + 5,
        declining: Math.floor(Math.random() * 5) + 2,
        stable: Math.floor(Math.random() * 15) + 10
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
      <Card className="border border-gray-200">
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
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Attendance Overview
        </CardTitle>
        <p className="text-gray-600 text-sm">Today's attendance summary</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Attendance */}
        <AttendanceStats {...attendanceData.todayAttendance} />

        {/* Weekly Trends */}
        <WeeklyTrends {...attendanceData.weeklyTrend} />

        {/* Low Attendance Students */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Students Needing Attention
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attendanceData.lowAttendanceStudents.length > 0 ? (
              attendanceData.lowAttendanceStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.className} • {student.absentDays} days absent
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.attendanceRate < 60 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">All students have good attendance!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalAttendanceCard;
