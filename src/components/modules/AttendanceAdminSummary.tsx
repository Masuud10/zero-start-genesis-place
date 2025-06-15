
import React from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AttendanceAdminSummaryProps {
  loading: boolean;
  error: string | null;
  attendanceSummary: any;
  schools: Array<{ id: string; name: string }>;
  schoolFilter: string | null;
  setSchoolFilter: (filter: string | null) => void;
}

const AttendanceAdminSummary: React.FC<AttendanceAdminSummaryProps> = ({
  loading,
  error,
  attendanceSummary,
  schools,
  schoolFilter,
  setSchoolFilter,
}) => {
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
};

export default AttendanceAdminSummary;
