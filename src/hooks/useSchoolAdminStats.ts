
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SchoolAdminStats {
  students: number;
  teachers: number;
  attendanceRate: number;
  feeCollection: number;
}

export const useSchoolAdminStats = (schoolId: string | null | undefined) => {
  const [stats, setStats] = useState<SchoolAdminStats>({
    students: 0,
    teachers: 0,
    attendanceRate: 0,
    feeCollection: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const currentTermPromise = supabase
        .from('academic_terms')
        .select('start_date, end_date')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .maybeSingle();

      const studentsCountPromise = supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('is_active', true);

      const teachersCountPromise = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('role', 'teacher');

      const today = new Date().toISOString().split('T')[0];
      const attendancePromise = supabase
        .from('attendance')
        .select('status')
        .eq('school_id', schoolId)
        .eq('date', today);
        
      const [
        { data: currentTerm }, 
        { count: studentsCount }, 
        { count: teachersCount }, 
        { data: attendance }
      ] = await Promise.all([
        currentTermPromise,
        studentsCountPromise,
        teachersCountPromise,
        attendancePromise
      ]);

      let attendanceRate = 0;
      if (attendance && attendance.length > 0) {
        const present = attendance.filter(a => a.status?.toLowerCase() === 'present').length;
        attendanceRate = (present / attendance.length) * 100;
      }

      const feesQuery = supabase
        .from('fees')
        .select('amount,paid_amount')
        .eq('school_id', schoolId);
      
      if (currentTerm?.start_date && currentTerm?.end_date) {
        feesQuery
          .gte('due_date', currentTerm.start_date)
          .lte('due_date', currentTerm.end_date);
      }

      const { data: fees } = await feesQuery;

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
  }, [schoolId]);

  return { stats, loading };
};
