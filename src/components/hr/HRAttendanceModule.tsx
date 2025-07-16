import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface HRAttendanceModuleProps {
  user: AuthUser;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  full_name: string;
  role_title: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  hours_worked: number;
  overtime_hours: number;
}

const HRAttendanceModule: React.FC<HRAttendanceModuleProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const { toast } = useToast();

  // Fetch attendance data with multi-tenant isolation
  const {
    data: attendanceRecords,
    isLoading,
    refetch,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["hr-attendance", user.school_id, dateFilter],
    queryFn: async () => {
      if (!user.school_id) {
        throw new Error("No school access");
      }

      // Get staff list first
      const { data: staff, error: staffError } = await supabase
        .from('support_staff')
        .select('id, employee_id, full_name, role_title')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Mock attendance data (in real implementation, this would come from an attendance tracking system)
      const today = new Date().toISOString().split('T')[0];
      
      return (staff || []).map((member: any) => ({
        id: `${member.id}-${today}`,
        employee_id: member.employee_id,
        full_name: member.full_name,
        role_title: member.role_title,
        date: today,
        check_in: Math.random() > 0.2 ? '08:30' : null,
        check_out: Math.random() > 0.3 ? '17:00' : null,
        status: Math.random() > 0.8 ? 'absent' : Math.random() > 0.9 ? 'late' : 'present',
        hours_worked: Math.floor(Math.random() * 3) + 7,
        overtime_hours: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
      })) as AttendanceRecord[];
    },
    enabled: !!user.school_id,
  });

  // Calculate attendance summary
  const attendanceSummary = React.useMemo(() => {
    if (!attendanceRecords) return null;

    const summary = attendanceRecords.reduce((acc, record) => {
      acc.totalStaff++;
      switch (record.status) {
        case 'present':
          acc.present++;
          break;
        case 'absent':
          acc.absent++;
          break;
        case 'late':
          acc.late++;
          break;
        case 'half_day':
          acc.halfDay++;
          break;
      }
      acc.totalHours += record.hours_worked;
      acc.overtimeHours += record.overtime_hours;
      return acc;
    }, {
      totalStaff: 0,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
      overtimeHours: 0,
      attendanceRate: 0,
    });

    summary.attendanceRate = summary.totalStaff > 0 
      ? Math.round((summary.present / summary.totalStaff) * 100) 
      : 0;

    return summary;
  }, [attendanceRecords]);

  // Filter attendance records
  const filteredRecords = attendanceRecords?.filter((record) => {
    const matchesSearch = record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      half_day: "bg-blue-100 text-blue-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-4 w-4" />;
      case 'absent':
        return <UserX className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarCheck className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CalendarCheck className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Monitoring</h2>
          <p className="text-muted-foreground">
            Track staff attendance patterns and work hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{attendanceSummary?.totalStaff || 0}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceSummary?.present || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendanceSummary?.absent || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {attendanceSummary?.attendanceRate || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {attendanceSummary?.totalHours || 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Attendance</CardTitle>
          <CardDescription>
            Daily attendance tracking and work hours monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {record.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{record.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.role_title} • {record.employee_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadge(record.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record.status)}
                            {record.status}
                          </div>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {record.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Check In/Out</p>
                        <p className="font-medium">
                          {record.check_in || '--'} - {record.check_out || '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hours Worked</p>
                        <p className="font-bold text-primary">
                          {record.hours_worked}h
                          {record.overtime_hours > 0 && (
                            <span className="text-xs text-orange-600 ml-1">
                              (+{record.overtime_hours}h OT)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No attendance records found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No attendance data available for the selected period"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRAttendanceModule;