import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { Building2, Users, BarChart3, GraduationCap, DollarSign, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SchoolAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🏫 SchoolAdminDashboard: Rendering for school admin:', user.email, 'Role:', user.role);

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    attendanceRate: 0,
    feeCollection: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.school_id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // 1. Students count
      const { count: studentsCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', user.school_id);

      // 2. Teachers count (from profiles table, role='teacher')
      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', user.school_id)
        .eq('role', 'teacher');

      // 3. Attendance rate (avg attendance for today)
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status', 'student_id')
        .eq('school_id', user.school_id)
        .eq('date', today);

      let attendanceRate = 0;
      if (attendance && attendance.length > 0) {
        const present = attendance.filter(a => a.status?.toLowerCase() === 'present').length;
        attendanceRate = attendance.length > 0 ? (present / attendance.length) * 100 : 0;
      }

      // 4. Fee Collection (percentage for current term)
      const { data: fees } = await supabase
        .from('fees')
        .select('amount, paid_amount')
        .eq('school_id', user.school_id);

      let feeCollection = 0;
      if (fees && fees.length > 0) {
        const total = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
        const paid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
        feeCollection = total > 0 ? (paid / total) * 100 : 0;
      }

      setStats({
        students: studentsCount ?? 0,
        teachers: teachersCount ?? 0,
        attendanceRate,
        feeCollection,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user.school_id]);

  const quickActions = [
    { id: 'students', label: 'Manage Students', icon: Users, description: 'Add, edit student records' },
    { id: 'grades', label: 'Review Grades', icon: GraduationCap, description: 'Monitor academic performance' },
    { id: 'finance', label: 'Financial Overview', icon: DollarSign, description: 'Track fees and payments' },
    { id: 'attendance', label: 'Attendance Reports', icon: CalendarCheck, description: 'Monitor daily attendance' },
    { id: 'analytics', label: 'School Analytics', icon: BarChart3, description: 'Performance insights' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">School Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's what's happening at your school.
          </p>
        </div>
      </div>

      {/* School Overview Cards (replacing static values) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <span className="animate-pulse">...</span> : stats.students}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.students === 0 ? "No students" : "+ students"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <span className="animate-pulse">...</span> : `${stats.attendanceRate.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.attendanceRate === 0 ? "No data" : "Today"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? <span className="animate-pulse">...</span> : `${stats.feeCollection.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.feeCollection === 0 ? "No data" : "Current term"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? <span className="animate-pulse">...</span> : stats.teachers}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.teachers === 0 ? "No teachers" : "All departments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Access key school management features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-24 flex-col gap-2 p-4"
                onClick={() => onModalOpen(action.id)}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
