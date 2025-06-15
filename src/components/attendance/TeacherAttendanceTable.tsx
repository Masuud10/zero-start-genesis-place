
import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Student, AttendanceStatus, AttendanceRecord } from "./TeacherAttendanceUtils";

interface TeacherAttendanceTableProps {
  students: Student[];
  attendanceMap: Record<string, AttendanceRecord>;
  setStatus: (studentId: string, status: AttendanceStatus) => void;
  setRemarks: (studentId: string, remarks: string) => void;
}

const TeacherAttendanceTable: React.FC<TeacherAttendanceTableProps> = ({
  students,
  attendanceMap,
  setStatus,
  setRemarks,
}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Admission #</TableCell>
        <TableCell>Status</TableCell>
        <TableCell>Remarks</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {students.map((student) => {
        const status = (attendanceMap[student.id]?.status || "present") as AttendanceStatus;
        const remarks = attendanceMap[student.id]?.remarks || "";
        return (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell>{student.admission_number}</TableCell>
            <TableCell>
              <Select value={status} onValueChange={(v) => setStatus(student.id, v as AttendanceStatus)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(student.id, e.target.value)}
                className="w-32 h-8 resize-none"
                placeholder="Optional"
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export default TeacherAttendanceTable;
