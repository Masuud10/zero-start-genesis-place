
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export interface ParentDashboardStats {
  childrenCount: number;
  attendance: number;
  feeBalance: number;
  recentGrade: string;
  recentSubject: string;
}

export const useParentDashboardStats = (user: AuthUser) => {
  const [stats, setStats] = useState<ParentDashboardStats>({
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
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      let childrenIds: string[] = [];
      const { data: directChildren } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', user.id);

      const { data: relationshipChildren } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id);

      if (directChildren) childrenIds = childrenIds.concat(directChildren.map(x => x.id));
      if (relationshipChildren) childrenIds = childrenIds.concat(relationshipChildren.map(x => x.student_id));
      childrenIds = [...new Set(childrenIds)];

      let attendancePercent = 0;
      let feeBalance = 0;
      let recentGrade = "";
      let recentSubject = "";

      if (childrenIds.length > 0) {
        // Attendance this month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().substring(0, 10);
        
        const { data: attendanceRows } = await supabase
          .from('attendance')
          .select('status')
          .in('student_id', childrenIds)
          .gte('date', firstDayOfMonth)
          .lte('date', lastDayOfMonth);
        
        if (attendanceRows) {
          const total = attendanceRows.length;
          const present = attendanceRows.filter(r => r.status?.toLowerCase() === 'present').length;
          attendancePercent = total > 0 ? (present / total) * 100 : 0;
        }

        // Fee balance
        const { data: studentFees } = await supabase
          .from('fees')
          .select('amount, paid_amount')
          .in('student_id', childrenIds);

        if (studentFees) {
          feeBalance = studentFees.reduce((sum, fee) => sum + (fee.amount || 0) - (fee.paid_amount || 0), 0);
        }

        // Recent grade
        const { data: grades } = await supabase
          .from('grades')
          .select('percentage, subjects(name)')
          .in('student_id', childrenIds)
          .order('created_at', { ascending: false })
          .limit(1);

        if (grades && grades.length > 0) {
          const grade = grades[0] as any;
          const percent = grade.percentage;
          recentGrade = percent !== undefined && percent !== null
            ? percent >= 80 ? "A" : percent >= 70 ? "B+" : percent >= 60 ? "B" : percent >= 50 ? "C" : "D"
            : "-";
          recentSubject = grade.subjects?.name || "Subject";
        }
      }

      setStats({
        childrenCount: childrenIds.length,
        attendance: attendancePercent,
        feeBalance,
        recentGrade,
        recentSubject,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id]);

  return { stats, loading };
};
