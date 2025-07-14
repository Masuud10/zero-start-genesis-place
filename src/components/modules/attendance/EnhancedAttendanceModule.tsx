import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AttendanceSessionValidator } from "@/utils/AttendanceSessionValidator";
import { format } from "date-fns";
import AttendanceSummaryReport from "@/components/attendance/AttendanceSummaryReport";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  subject_id?: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  term_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
  students?: {
    name: string;
    admission_number: string;
  };
  classes?: {
    name: string;
  };
  subjects?: {
    name: string;
  };
  academic_terms?: {
    term_name: string;
  };
  academic_years?: {
    year_name: string;
  };
}

const EnhancedAttendanceModule = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filters and UI
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"daily" | "summary" | "reports">(
    "daily"
  );
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  // Modal states
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Use attendance reports hook
  const { generateAttendancePDF, printAttendanceReport, isGenerating } = useAttendanceReports();

  // Use academic module integration
  const {
    context,
    isLoading,
    error,
    data,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration([
    "attendance",
    "grades", 
    "examinations",
    "reports",
    "analytics",
  ]);

  // Get available classes and subjects from context data
  const availableClasses = data?.attendance || [];
  const availableSubjects = data?.attendance || [];
  const students = data?.attendance || [];

  // Filter subjects based on selected class
  const filteredSubjects = selectedClass !== "all" 
    ? availableSubjects?.filter(subject => subject.class_id === selectedClass) || []
    : availableSubjects;
  
  // Filter students based on selected class  
  const filteredStudents = selectedClass !== "all"
    ? students?.filter(student => student.class_id === selectedClass) || []
    : students;

  // Filter attendance records
  const filteredAttendance =
    data.attendance?.filter((record: AttendanceRecord) => {
      const matchesDate = record.date === selectedDate;
      const matchesClass =
        selectedClass === "all" || record.class_id === selectedClass;
      const matchesSubject =
        selectedSubject === "all" || record.subject_id === selectedSubject;
      const matchesSearch =
        record.students?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.students?.admission_number?.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      return (
        matchesDate &&
        matchesClass &&
        matchesSubject &&
        matchesSearch &&
        matchesStatus
      );
    }) || [];

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(
      (r) => r.status === "present"
    ).length;
    const absent = filteredAttendance.filter(
      (r) => r.status === "absent"
    ).length;
    const late = filteredAttendance.filter((r) => r.status === "late").length;
    const excused = filteredAttendance.filter(
      (r) => r.status === "excused"
    ).length;
    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }, [filteredAttendance]);

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: {
      student_id: string;
      status: string;
      date: string;
      class_id: string;
      subject_id?: string;
    }) => {
      const { error } = await supabase.from("attendance").upsert({
        ...attendanceData,
        term_id: context?.term_id,
        academic_year_id: context?.academic_year_id,
        school_id: schoolId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      refreshData();
      setShowSummaryReport(true); // Show summary report after attendance is marked
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });

  // Bulk update attendance mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (
      updates: Array<{
        id: string;
        status: string;
      }>
    ) => {
      // Note: bulk update needs proper structure with all required fields
      const formattedUpdates = updates.map(update => ({
        ...update,
        date: selectedDate,
        school_id: schoolId || '',
      }));
      const { error } = await supabase.from("attendance").upsert(formattedUpdates);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
      refreshData();
      setBulkEditModalOpen(false);
      setShowSummaryReport(true); // Show summary report after bulk update
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  // Handle marking attendance
  const handleMarkAttendance = (studentId: string, status: string) => {
    if (!isValid) {
      toast({
        title: "Validation Error",
        description:
          validation?.errors?.join(", ") ||
          "Please set up academic year and term first",
        variant: "destructive",
      });
      return;
    }

    markAttendanceMutation.mutate({
      student_id: studentId,
      status,
      date: selectedDate,
      class_id: selectedClass,
      subject_id: selectedSubject !== "all" ? selectedSubject : undefined,
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      case "excused":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Excused
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading attendance data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage student attendance across classes and subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode("daily")}
            className={viewMode === "daily" ? "bg-blue-50" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Daily View
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("reports")}
            className={viewMode === "reports" ? "bg-blue-50" : ""}
          >
            <Download className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Current Academic Period Info */}
      {currentPeriod && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              Current Academic Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="bg-blue-100">
                {currentPeriod.year?.year_name || "Not Set"}
              </Badge>
              <Badge variant="outline" className="bg-blue-100">
                {currentPeriod.term?.term_name || "Not Set"}
              </Badge>
              {!isValid && (
                <Badge variant="destructive" className="text-xs">
                  Context Invalid
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {!isValid && validation?.errors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Academic Context Issues:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filteredSubjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setBulkEditModalOpen(true)}
                disabled={!isValid || filteredAttendance.length === 0}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bulk Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{attendanceStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-xl font-bold">{attendanceStats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-xl font-bold">{attendanceStats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-xl font-bold">{attendanceStats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-xl font-bold">
                  {attendanceStats.attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Attendance -{" "}
            {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records found</p>
              <p className="text-sm">
                {searchTerm ||
                selectedClass !== "all" ||
                selectedSubject !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Mark attendance for the selected date and class"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.students?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {record.students?.admission_number || "N/A"}
                    </TableCell>
                    <TableCell>{record.classes?.name || "N/A"}</TableCell>
                    <TableCell>{record.subjects?.name || "General"}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(record.student_id, "present")
                          }
                          disabled={markAttendanceMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(record.student_id, "absent")
                          }
                          disabled={markAttendanceMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(record.student_id, "late")
                          }
                          disabled={markAttendanceMutation.isPending}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAttendance(record.student_id, "excused")
                          }
                          disabled={markAttendanceMutation.isPending}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary Report */}
      {showSummaryReport && filteredAttendance.length > 0 && (
        <AttendanceSummaryReport
          className={availableClasses?.find(c => c.id === selectedClass)?.name || "All Classes"}
          date={selectedDate}
          attendanceRecords={filteredAttendance.map(record => ({
            id: record.id,
            student_id: record.student_id,
            status: record.status,
            student_name: record.students?.name,
            admission_number: record.students?.admission_number,
            roll_number: record.students?.admission_number, // Using admission_number as fallback
          }))}
          onExportPDF={() => {
            const className = availableClasses?.find(c => c.id === selectedClass)?.name || "All Classes";
            const attendanceData = filteredAttendance.map(record => ({
              student_id: record.student_id,
              student_name: record.students?.name || "Unknown",
              admission_number: record.students?.admission_number,
              status: record.status,
            }));
            generateAttendancePDF(className, selectedDate, attendanceData);
          }}
          onPrint={() => {
            const className = availableClasses?.find(c => c.id === selectedClass)?.name || "All Classes";
            const attendanceData = filteredAttendance.map(record => ({
              student_id: record.student_id,
              student_name: record.students?.name || "Unknown",
              admission_number: record.students?.admission_number,
              status: record.status,
            }));
            printAttendanceReport(className, selectedDate, attendanceData);
          }}
        />
      )}

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Edit Attendance</DialogTitle>
            <DialogDescription>
              Update attendance status for multiple students at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  const updates = filteredAttendance.map((record) => ({
                    id: record.id,
                    status: "present",
                  }));
                  bulkUpdateMutation.mutate(updates);
                }}
                disabled={bulkUpdateMutation.isPending}
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
              <Button
                onClick={() => {
                  const updates = filteredAttendance.map((record) => ({
                    id: record.id,
                    status: "absent",
                  }));
                  bulkUpdateMutation.mutate(updates);
                }}
                disabled={bulkUpdateMutation.isPending}
                className="bg-red-100 text-red-800 hover:bg-red-200"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark All Absent
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkEditModalOpen(false)}
                disabled={bulkUpdateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedAttendanceModule;
