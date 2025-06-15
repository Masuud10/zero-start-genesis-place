import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AttendanceAdminSummary from './AttendanceAdminSummary';

const AttendanceModule: React.FC = () => {
  const { user } = useAuth();
  const isEdufamAdmin = user?.role === 'edufam_admin';

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schools for dropdown (for admin filter)
  useEffect(() => {
    if (!isEdufamAdmin) return;
    supabase.from("schools")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) setError("Could not fetch schools");
        else setSchools(data || []);
      });
  }, [isEdufamAdmin]);

  // Fetch attendance summary for admin
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query;
    if (schoolFilter) {
      query = (supabase.rpc as any)('get_attendance_summary', { school_id: schoolFilter });
    } else {
      query = (supabase.rpc as any)('get_attendance_summary');
    }
    query.then(({ data, error }: any) => {
      if (error) setError("Failed to fetch attendance summary");
      setAttendanceSummary(data || null);
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  // Edufam admin: summary only
  if (isEdufamAdmin) {
    return (
      <AttendanceAdminSummary
        loading={loading}
        error={error}
        attendanceSummary={attendanceSummary}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  }

  // For all non-Edufam admins, we won't return anything here (to avoid reference errors from the truncated code block).
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
    </div>
  );
};

export default AttendanceModule;
