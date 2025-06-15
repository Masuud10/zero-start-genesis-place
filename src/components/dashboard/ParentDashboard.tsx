import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { User, GraduationCap, CalendarCheck, DollarSign, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ReportDownloadPanel from '@/components/reports/ReportDownloadPanel';

interface ParentDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onModalOpen }) => {
  console.log('👨‍👩‍👧‍👦 ParentDashboard: Rendering for parent:', user.email);

  const [stats, setStats] = useState({
    childrenCount: 0,
    attendance: 0,
    feeBalance: 0,
    recentGrade: "",
    recentSubject: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      if (!user?.id || !user?.school_id) {
        setLoading(false);
        return;
      }
      // 1. Find children (students with parent_id = this user OR via parent_students table)
      let children: any[] = [];
      const { data: directChildren } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', user.id);

      const { data: relationshipChildren } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id);

      if (directChildren) children = children.concat(directChildren.map(x => x.id));
      if (relationshipChildren) children = children.concat(relationshipChildren.map(x => x.student_id));
      children = [...new Set(children)]; // Unique

      // 2. Attendance this month (for all children)
      let attendancePercent = 0;
      let feeBalance = 0;
      let recentGrade = "";
      let recentSubject = "";

      if (children.length > 0) {
        // Attendance
        const currMonth = new Date().getMonth() + 1;
        const currYear = new Date().getFullYear();
        const { data: attendanceRows } = await supabase
          .from('attendance')
          .select('status, student_id, date')
          .in('student_id', children);

        if (attendanceRows) {
          const monthRows = attendanceRows.filter(r => {
            const d = new Date(r.date);
            return d.getFullYear() === currYear && (d.getMonth() + 1) === currMonth;
          });
          const total = monthRows.length;
          const present = monthRows.filter(r => r.status?.toLowerCase() === 'present').length;
          attendancePercent = total > 0 ? (present / total) * 100 : 0;
        }

        // Fee balance (sum across all children)
        const { data: studentFees } = await supabase
          .from('fees')
          .select('student_id, amount, paid_amount')
          .in('student_id', children);

        if (studentFees) {
          feeBalance = studentFees.reduce((sum, fee) => sum + (fee.amount || 0) - (fee.paid_amount || 0), 0);
        }

        // Recent grade
        const { data: grades } = await supabase
          .from('grades')
          .select('term, percentage, subject_id')
          .in('student_id', children)
          .order('created_at', { ascending: false })
          .limit(1);

        if (grades && grades.length > 0) {
          const percent = grades[0].percentage;
          recentGrade = percent !== undefined && percent !== null
            ? percent >= 80 ? "A" : percent >= 70 ? "B+" : percent >= 60 ? "B" : percent >= 50 ? "C" : "D"
            : "-";
          // In a real app, subject name lookup would be here too.
          recentSubject = grades[0].subject_id || "";
        }
      }

      setStats({
        childrenCount: children.length,
        attendance: attendancePercent,
        feeBalance,
        recentGrade,
        recentSubject,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id, user.school_id]);

  const parentActions = [
    { id: 'grades', label: 'Child Grades', icon: GraduationCap, description: 'View academic performance' },
    { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck, description: 'Check daily attendance' },
    { id: 'finance', label: 'School Fees', icon: DollarSign, description: 'Payment history & balance' },
    { id: 'messages', label: 'School Messages', icon: MessageSquare, description: 'Communications from school' },
  ];

  return (
    <div className="space-y-6">
      <ReportDownloadPanel />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome {user.name || 'Parent'}! Stay connected with your child's education.
          </p>
        </div>
      </div>

      {/* Parent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Children Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <span className="animate-pulse">...</span> : stats.childrenCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.childrenCount === 0 ? "No children" : "Active students"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <span className="animate-pulse">...</span> : `${stats.attendance.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.attendance === 0 ? "No data" : "Excellent attendance"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? <span className="animate-pulse">...</span> : `KES ${stats.feeBalance.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.feeBalance === 0 ? "No balance" : "Due soon"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? <span className="animate-pulse">...</span> : stats.recentGrade}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.recentGrade === "" ? "No data" : stats.recentSubject}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Parent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Parent Portal
          </CardTitle>
          <CardDescription>
            Access your child's educational information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parentActions.map((action) => (
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

export default ParentDashboard;
