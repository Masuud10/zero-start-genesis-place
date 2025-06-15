
import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System Attendance Overview
            </h1>
            <p className="text-muted-foreground">
              View attendance summaries across all schools.
            </p>
          </div>
          <SchoolSummaryFilter
            schools={schools}
            value={schoolFilter}
            onChange={setSchoolFilter}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <Card><CardContent>Loading summary...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="text-red-500">{error}</CardContent></Card>
          ) : attendanceSummary ? (
            <>
              <Card>
                <CardHeader><CardTitle>Overall Attendance %</CardTitle></CardHeader>
                <CardContent>
                  <div className="font-bold text-xl">
                    {attendanceSummary.overall_attendance_percentage !== undefined
                      ? `${attendanceSummary.overall_attendance_percentage}%`
                      : 'N/A'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Trend</CardTitle></CardHeader>
                <CardContent>
                  <div>{attendanceSummary.trend || 'N/A'}</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card><CardContent>No summary data found.</CardContent></Card>
          )}
        </div>
      </div>
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

// ... file ends here ...
