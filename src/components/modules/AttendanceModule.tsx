import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const AttendanceModule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const { user } = useAuth();
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const attendanceStats = {
    totalStudents: 1247,
    present: 1174,
    absent: 73,
    attendanceRate: 94.2
  };

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '8a', name: 'Grade 8A' },
    { id: '8b', name: 'Grade 8B' },
    { id: '7a', name: 'Grade 7A' },
    { id: '7b', name: 'Grade 7B' },
  ];

  const isElimshaAdmin = user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';
  const canEditAttendance = hasPermission(PERMISSIONS.EDIT_GRADEBOOK); // Using gradebook permission as proxy for attendance editing

  // Mock students data for the selected class
  const mockStudents = [
    { id: '1', name: 'John Doe', admissionNumber: 'ADM001', rollNumber: 'R001' },
    { id: '2', name: 'Jane Smith', admissionNumber: 'ADM002', rollNumber: 'R002' },
    { id: '3', name: 'Mike Johnson', admissionNumber: 'ADM003', rollNumber: 'R003' },
  ];

  // Mock attendance stats for analytics
  const mockAttendanceStats = [
    {
      studentId: '1',
      totalDays: 100,
      presentDays: 95,
      absentDays: 3,
      lateDays: 2,
      attendanceRate: 95.0,
      morningAttendanceRate: 96.0,
      afternoonAttendanceRate: 94.0
    },
    {
      studentId: '2',
      totalDays: 100,
      presentDays: 88,
      absentDays: 10,
      lateDays: 2,
      attendanceRate: 88.0,
      morningAttendanceRate: 90.0,
      afternoonAttendanceRate: 86.0
    },
    {
      studentId: '3',
      totalDays: 100,
      presentDays: 92,
      absentDays: 6,
      lateDays: 2,
      attendanceRate: 92.0,
      morningAttendanceRate: 94.0,
      afternoonAttendanceRate: 90.0
    }
  ];

  const handleAttendanceSubmit = (entries: any[]) => {
    console.log('Attendance entries submitted:', entries);
  };

  // For Elimisha admins, show only overview and analytics
  if (isElimshaAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System-Wide Attendance Overview
            </h1>
            <p className="text-muted-foreground">System administrator view - attendance summaries across all schools</p>
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
              <p className="text-xs text-muted-foreground">Across all schools</p>
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
              <p className="text-xs text-muted-foreground">Network-wide rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin-only analytics and summaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              Attendance Analytics (Read-Only)
            </CardTitle>
            <CardDescription>
              System-wide attendance analytics - Elimisha admins have view-only access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Administrator Access Level</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                As an Elimisha administrator, you can view attendance summaries and analytics but cannot mark attendance. 
                Attendance marking is restricted to teachers and school administrators.
              </p>
            </div>
            
            <AttendanceAnalytics stats={mockAttendanceStats} />
          </CardContent>
        </Card>
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
