import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Printer,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  student_name?: string;
  admission_number?: string;
  roll_number?: string;
}

interface AttendanceSummaryReportProps {
  className: string;
  date: string;
  attendanceRecords: AttendanceRecord[];
  onExportPDF: () => void;
  onPrint: () => void;
}

export const AttendanceSummaryReport: React.FC<AttendanceSummaryReportProps> = ({
  className,
  date,
  attendanceRecords,
  onExportPDF,
  onPrint,
}) => {
  // Calculate statistics
  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;
  const excusedCount = attendanceRecords.filter(r => r.status === "excused").length;
  const totalStudents = attendanceRecords.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case "excused":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Excused</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Summary Report
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-4">
                  <span><strong>Class:</strong> {className}</span>
                  <span><strong>Date:</strong> {format(new Date(date), "PPP")}</span>
                  <span><strong>Total Students:</strong> {totalStudents}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{presentCount}</div>
              <div className="text-sm text-green-600">Present</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-800">{absentCount}</div>
              <div className="text-sm text-red-600">Absent</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-800">{lateCount}</div>
              <div className="text-sm text-yellow-600">Late</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-800">{excusedCount}</div>
              <div className="text-sm text-blue-600">Excused</div>
            </div>
          </div>

          {/* Attendance Percentage */}
          <div className="bg-primary/10 p-4 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>
          </div>

          {/* Student List Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission Number</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        {record.student_name || "Unknown Student"}
                      </div>
                    </TableCell>
                    <TableCell>{record.admission_number || "N/A"}</TableCell>
                    <TableCell>{record.roll_number || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {attendanceRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this date.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSummaryReport;