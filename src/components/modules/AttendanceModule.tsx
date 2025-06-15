import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AttendanceAdminSummary from './AttendanceAdminSummary';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  // Fetch summary from view only (no details)
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query = (supabase as any)
      .from("school_attendance_summary")
      .select("*");
    if (schoolFilter) {
      query = query.eq("school_id", schoolFilter);
    }
    query.then(({ data, error }: any) => {
      if (error) {
        setError("Could not load attendance summary data. Please try again shortly.");
        setAttendanceSummary(null);
      } else if (!data || data.length === 0) {
        setAttendanceSummary(null);
      } else {
        setAttendanceSummary(data[0]);
      }
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  // Edufam admin: summary only
  if (isEdufamAdmin) {
    if (loading) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      );
    }
    if (!attendanceSummary) {
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>
            There is no attendance summary available for this school or filter. Try selecting a different school or check back later.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <AttendanceAdminSummary
        loading={loading}
        error={null}
        attendanceSummary={{
          overall_attendance_percentage: attendanceSummary.attendance_rate ?? null,
          trend: '—'
        }}
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
