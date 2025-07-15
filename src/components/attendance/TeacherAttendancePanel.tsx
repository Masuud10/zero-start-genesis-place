import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import AttendanceSessionValidator from "./AttendanceSessionValidator";
import { Textarea } from "@/components/ui/textarea";
import AttendanceExportModal from "./AttendanceExportModal";
import {
  AttendanceExportService,
  ExportOptions,
} from "@/services/attendanceExportService";
import AttendanceSummaryReport from "./AttendanceSummaryReport";

interface TeacherAttendancePanelProps {
  userId: string;
  schoolId: string | null;
  userRole: string;
}

const TeacherAttendancePanel: React.FC<TeacherAttendancePanelProps> = ({
  userId,
  schoolId,
  userRole,
}) => {
  const { academicInfo } = useCurrentAcademicInfo(schoolId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSession, setSelectedSession] = useState("morning");
  const [sessionError, setSessionError] = useState("");
  const [attendance, setAttendance] = useState<
    Record<string, { status: string; remarks: string }>
  >({});
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showSummaryReport, setShowSummaryReport] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students", schoolId, selectedClass],
    queryFn: async () => {
      if (!schoolId || !selectedClass) return [];

      const { data, error } = await supabase
        .from("students")
        .select("id, name, admission_number")
        .eq("school_id", schoolId)
        .eq("class_id", selectedClass)
        .eq("is_active", true)
        .order("name");

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId && !!selectedClass,
  });

  const { data: existingAttendance } = useQuery({
    queryKey: [
      "attendance",
      schoolId,
      selectedClass,
      selectedDate,
      selectedSession,
    ],
    queryFn: async () => {
      if (!schoolId || !selectedClass || !selectedDate) return [];

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("school_id", schoolId)
        .eq("class_id", selectedClass)
        .eq("date", selectedDate)
        .eq("session", selectedSession);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId && !!selectedClass && !!selectedDate,
  });

  React.useEffect(() => {
    if (existingAttendance) {
      const attendanceMap = existingAttendance.reduce((acc, att) => {
        acc[att.student_id] = {
          status: att.status || "present",
          remarks: att.remarks || "",
        };
        return acc;
      }, {} as Record<string, { status: string; remarks: string }>);
      setAttendance(attendanceMap);
    }
  }, [existingAttendance]);

  const submitAttendance = useMutation({
    mutationFn: async () => {
      if (
        !selectedSession ||
        !["morning", "afternoon", "full_day"].includes(selectedSession)
      ) {
        throw new Error(
          "Please select a valid session (morning, afternoon, or full day)"
        );
      }

      if (
        !schoolId ||
        !selectedClass ||
        !selectedDate ||
        !academicInfo.term ||
        !academicInfo.year
      ) {
        throw new Error(
          "Missing required information. Please ensure all fields are selected."
        );
      }

      if (Object.keys(attendance).length === 0) {
        throw new Error("No attendance data to submit");
      }

      const attendanceRecords = Object.entries(attendance).map(
        ([studentId, record]) => ({
          student_id: studentId,
          class_id: selectedClass,
          school_id: schoolId,
          date: selectedDate,
          status: record.status,
          session: selectedSession, // Ensure session is always included
          remarks: record.remarks || null,
          term: academicInfo.term,
          academic_year: academicInfo.year,
          submitted_by: userId,
          submitted_at: new Date().toISOString(),
        })
      );

      console.log("Submitting attendance records:", attendanceRecords);

      const { error } = await supabase
        .from("attendance")
        .upsert(attendanceRecords, {
          onConflict: "school_id,class_id,student_id,date,session",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Attendance upsert error:", error);
        throw new Error(error.message || "Failed to save attendance");
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Attendance submitted successfully for ${
          Object.keys(attendance).length
        } students.`,
      });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setSessionError("");
      // Automatically show summary report after successful save
      setShowSummaryReport(true);
    },
    onError: (error) => {
      console.error("Attendance submission error:", error);
      if (error.message.includes("session")) {
        setSessionError(error.message);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    setSessionError("");
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAllPresent = () => {
    if (students) {
      const allPresent = students.reduce((acc, student) => {
        acc[student.id] = { status: "present", remarks: "" };
        return acc;
      }, {} as Record<string, { status: string; remarks: string }>);
      setAttendance(allPresent);
    }
  };

  // Enhanced export attendance data
  const exportAttendance = async (format: "excel" | "pdf") => {
    if (!selectedClass || !students || Object.keys(attendance).length === 0) {
      toast({
        title: "Export Failed",
        description:
          "No attendance data to export. Please select a class and mark attendance first.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading(true);
    try {
      const selectedClassName =
        classes?.find((c) => c.id === selectedClass)?.name || selectedClass;
      const fileName = `attendance_${selectedClassName}_${selectedDate}_${selectedSession}`;

      if (format === "excel") {
        // Generate Excel/CSV export
        const csvContent = [
          // Header
          ["Attendance Report"],
          [`Class: ${selectedClassName}`],
          [`Date: ${selectedDate}`],
          [`Session: ${selectedSession}`],
          [`Term: ${academicInfo.term || "Not Set"}`],
          [`Academic Year: ${academicInfo.year || "Not Set"}`],
          [`Generated by: ${userRole}`],
          [`Generated on: ${new Date().toLocaleString()}`],
          [],
          // Data headers
          ["Student Name", "Admission Number", "Status", "Remarks"],
          // Data rows
          ...students.map((student) => [
            student.name,
            student.admission_number || "N/A",
            attendance[student.id]?.status || "Not Marked",
            attendance[student.id]?.remarks || "",
          ]),
          [],
          // Summary
          ["Summary"],
          ["Total Students", students.length.toString()],
          [
            "Present",
            Object.values(attendance)
              .filter((a) => a.status === "present")
              .length.toString(),
          ],
          [
            "Absent",
            Object.values(attendance)
              .filter((a) => a.status === "absent")
              .length.toString(),
          ],
          [
            "Late",
            Object.values(attendance)
              .filter((a) => a.status === "late")
              .length.toString(),
          ],
          [
            "Excused",
            Object.values(attendance)
              .filter((a) => a.status === "excused")
              .length.toString(),
          ],
        ]
          .map((row) => row.join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Attendance data exported as CSV successfully.`,
        });
      } else if (format === "pdf") {
        // Generate PDF export using browser print
        const pdfContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Attendance Report - ${selectedClassName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .info { margin-bottom: 20px; }
                .attendance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .attendance-table th, .attendance-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .attendance-table th { background-color: #f5f5f5; font-weight: bold; }
                .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Attendance Report</h1>
                <div class="info">
                  <p><strong>Class:</strong> ${selectedClassName}</p>
                  <p><strong>Date:</strong> ${selectedDate}</p>
                  <p><strong>Session:</strong> ${selectedSession}</p>
                  <p><strong>Term:</strong> ${
                    academicInfo.term || "Not Set"
                  }</p>
                  <p><strong>Academic Year:</strong> ${
                    academicInfo.year || "Not Set"
                  }</p>
                  <p><strong>Generated by:</strong> ${userRole}</p>
                  <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
              
              <table class="attendance-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Admission Number</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${students
                    .map(
                      (student) => `
                    <tr>
                      <td>${student.name}</td>
                      <td>${student.admission_number || "N/A"}</td>
                      <td>${attendance[student.id]?.status || "Not Marked"}</td>
                      <td>${attendance[student.id]?.remarks || ""}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              
              <div class="summary">
                <h3>Summary</h3>
                <p><strong>Total Students:</strong> ${students.length}</p>
                <p><strong>Present:</strong> ${
                  Object.values(attendance).filter(
                    (a) => a.status === "present"
                  ).length
                }</p>
                <p><strong>Absent:</strong> ${
                  Object.values(attendance).filter((a) => a.status === "absent")
                    .length
                }</p>
                <p><strong>Late:</strong> ${
                  Object.values(attendance).filter((a) => a.status === "late")
                    .length
                }</p>
                <p><strong>Excused:</strong> ${
                  Object.values(attendance).filter(
                    (a) => a.status === "excused"
                  ).length
                }</p>
              </div>
              
              <div class="footer">
                <p>Powered by EduFam</p>
              </div>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(pdfContent);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
        }

        toast({
          title: "PDF Export",
          description: "PDF export initiated. Check your print dialog.",
        });
      }
    } catch (error) {
      console.error("Error exporting attendance:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Advanced export function using the new service
  const handleAdvancedExport = async (options: ExportOptions) => {
    setExportLoading(true);
    try {
      await AttendanceExportService.exportAttendance(options);

      toast({
        title: "Export Successful",
        description: `Attendance data exported as ${options.format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      console.error("Advanced export failed:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export attendance data.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "excused":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const attendanceStats = React.useMemo(() => {
    const total = Object.keys(attendance).length;
    const present = Object.values(attendance).filter(
      (a) => a.status === "present"
    ).length;
    const absent = Object.values(attendance).filter(
      (a) => a.status === "absent"
    ).length;
    const late = Object.values(attendance).filter(
      (a) => a.status === "late"
    ).length;
    const excused = Object.values(attendance).filter(
      (a) => a.status === "excused"
    ).length;

    return { total, present, absent, late, excused };
  }, [attendance]);

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No school assignment found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Attendance Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <AttendanceSessionValidator
                value={selectedSession}
                onValueChange={handleSessionChange}
                error={sessionError}
                required={true}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={markAllPresent}
                variant="outline"
                className="w-full"
              >
                Mark All Present
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <Badge variant="outline">
              Term: {academicInfo.term || "Not Set"}
            </Badge>
            <Badge variant="outline">
              Academic Year: {academicInfo.year || "Not Set"}
            </Badge>
            {/* Debug info - can be removed later */}
            {process.env.NODE_ENV === 'development' && (
              <Badge variant="outline" className="bg-yellow-50">
                Debug: {JSON.stringify({term: academicInfo.term, year: academicInfo.year})}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Stats */}
      {Object.keys(attendance).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceStats.total}
                </div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceStats.present}
                </div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {attendanceStats.absent}
                </div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceStats.late}
                </div>
                <div className="text-sm text-yellow-600">Late</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {attendanceStats.excused}
                </div>
                <div className="text-sm text-purple-600">Excused</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      {selectedClass ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Attendance</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setExportModalOpen(true)}
                  disabled={exportLoading}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading ? "Exporting..." : "Advanced Export"}
                </Button>
                <Button
                  onClick={() => exportAttendance("excel")}
                  disabled={
                    Object.keys(attendance).length === 0 || exportLoading
                  }
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading ? "Exporting..." : "Quick CSV"}
                </Button>
                <Button
                  onClick={() => exportAttendance("pdf")}
                  disabled={
                    Object.keys(attendance).length === 0 || exportLoading
                  }
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading ? "Exporting..." : "Quick PDF"}
                </Button>
                <Button
                  onClick={() => {
                    console.log("Save attendance clicked. Current state:", {
                      attendance: Object.keys(attendance).length,
                      showSummaryReport,
                      selectedClass,
                      students: students?.length
                    });
                    submitAttendance.mutate();
                  }}
                  disabled={
                    Object.keys(attendance).length === 0 ||
                    submitAttendance.isPending
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {submitAttendance.isPending ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3">Loading students...</p>
              </div>
            ) : students && students.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">
                        Student Name
                      </TableHead>
                      <TableHead className="font-semibold">
                        Admission No.
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {student.admission_number}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={attendance[student.id]?.status || "present"}
                            onValueChange={(value) =>
                              handleStatusChange(student.id, value)
                            }
                          >
                            <SelectTrigger
                              className={`w-32 ${getStatusColor(
                                attendance[student.id]?.status || "present"
                              )}`}
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(
                                  attendance[student.id]?.status || "present"
                                )}
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Present
                                </div>
                              </SelectItem>
                              <SelectItem value="absent">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  Absent
                                </div>
                              </SelectItem>
                              <SelectItem value="late">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                  Late
                                </div>
                              </SelectItem>
                              <SelectItem value="excused">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                                  Excused
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={attendance[student.id]?.remarks || ""}
                            onChange={(e) =>
                              handleRemarksChange(student.id, e.target.value)
                            }
                            placeholder="Add remarks (optional)"
                            className="min-h-[60px] resize-none"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No students found for the selected class. Please check class
                  setup and student assignments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Please select a class to view students and mark attendance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Attendance Summary Report - Class Specific */}
      {showSummaryReport && selectedClass && students && Object.keys(attendance).length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Daily Attendance Summary - {classes?.find(c => c.id === selectedClass)?.name}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSummaryReport(false)}
            >
              Hide Summary
            </Button>
          </div>
          <AttendanceSummaryReport
            className={classes?.find(c => c.id === selectedClass)?.name || "Selected Class"}
            date={selectedDate}
            attendanceRecords={students.map(student => ({
              id: student.id,
              student_id: student.id,
              status: (attendance[student.id]?.status as "present" | "absent" | "late" | "excused") || "present",
              student_name: student.name,
              admission_number: student.admission_number,
              roll_number: student.admission_number, // Using admission_number as roll_number fallback
            }))}
            onExportPDF={() => {
              // Class-specific PDF export
              const classSpecificData = {
                className: classes?.find(c => c.id === selectedClass)?.name || "Unknown Class",
                classId: selectedClass,
                date: selectedDate,
                attendanceData: students.map(student => ({
                  student_id: student.id,
                  student_name: student.name,
                  admission_number: student.admission_number,
                  roll_number: student.admission_number,
                  status: attendance[student.id]?.status || "present"
                }))
              };
              console.log("Exporting class-specific attendance PDF:", classSpecificData);
              exportAttendance("pdf");
            }}
            onPrint={() => {
              // Class-specific print functionality
              const classSpecificContent = `
                Daily Attendance Report
                Class: ${classes?.find(c => c.id === selectedClass)?.name}
                Date: ${new Date(selectedDate).toLocaleDateString()}
                Total Students: ${students.length}
              `;
              console.log("Printing class-specific attendance:", classSpecificContent);
              window.print();
            }}
          />
        </div>
      )}

      {/* Advanced Export Modal */}
      <AttendanceExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleAdvancedExport}
        classes={classes || []}
        selectedClass={selectedClass}
        loading={exportLoading}
      />
    </div>
  );
};

export default TeacherAttendancePanel;
