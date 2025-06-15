import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, UserCheck, UserX, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import BulkAttendanceTable from '@/components/attendance/BulkAttendanceTable';
import AttendanceAnalytics from '@/components/attendance/AttendanceAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import DownloadReportButton from "@/components/reports/DownloadReportButton";

const AttendanceModule: React.FC = () => {
  const { user } = useAuth();
  const isEdufamAdmin = user?.role === 'edufam_admin';

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schools for dropdown
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
    let query = supabase.rpc('get_attendance_summary', { school_id: schoolFilter });
    if (!schoolFilter) query = supabase.rpc('get_attendance_summary');
    query.then(({ data, error }) => {
      if (error) setError("Failed to fetch attendance summary");
      setAttendanceSummary(data || null);
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

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
                    {attendanceSummary.overall_attendance_percentage ? `${attendanceSummary.overall_attendance_percentage}%` : 'N/A'}
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

  // Regular interface for other roles
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isElimshaAdmin
              ? "System-Wide Attendance Overview"
              : "Attendance Management"}
          </h1>
          <p className="text-muted-foreground">
            {isElimshaAdmin
              ? "System administrator view - attendance summaries across all schools"
              : "Track and manage student attendance"}
          </p>
        </div>
        <DownloadReportButton
          type="attendance"
          label="Download Attendance Report"
          queryFilters={isElimshaAdmin ? {} : { school_id: user?.school_id }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
            <p className="text-xs text-muted-foreground">Students present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
            <p className="text-xs text-muted-foreground">Students absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              {canEditAttendance ? 'Attendance Tracking' : 'Attendance Overview'}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md"
                disabled={!canEditAttendance}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {canEditAttendance ? (
            <Tabs defaultValue="mark" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
                <TabsTrigger value="view">View Records</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mark" className="mt-6">
                <BulkAttendanceTable 
                  students={mockStudents}
                  date={selectedDate}
                  sessionType="full-day"
                  onSubmit={handleAttendanceSubmit}
                  isSubmitting={false}
                />
              </TabsContent>
              
              <TabsContent value="view" className="mt-6">
                <BulkAttendanceTable 
                  students={mockStudents}
                  date={selectedDate}
                  sessionType="full-day"
                  onSubmit={handleAttendanceSubmit}
                  isSubmitting={false}
                />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-6">
                <AttendanceAnalytics stats={mockAttendanceStats} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">View-Only Access</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You have read-only access to attendance information. Contact a teacher to mark attendance.
                </p>
              </div>
              
              <AttendanceAnalytics stats={mockAttendanceStats} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceModule;
