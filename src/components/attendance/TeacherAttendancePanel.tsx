
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeacherAttendancePanelProps {
  teacherId: string;
  schoolId?: string;
}

type Student = {
  id: string;
  name: string;
  admission_number: string;
};

type AttendanceStatus = "present" | "absent" | "late";

const sessionOptions = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
];

const TeacherAttendancePanel: React.FC<TeacherAttendancePanelProps> = ({ teacherId, schoolId }) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState<string>("morning");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    async function fetchClasses() {
      if (!teacherId) return;
      const { data, error } = await supabase
        .from("teacher_classes")
        .select("class_id, classes(name)")
        .eq("teacher_id", teacherId);
      if (!error && Array.isArray(data)) {
        setClasses(
          data
            .map((row: any) =>
              row.classes
                ? { id: row.class_id, name: row.classes.name }
                : null
            )
            .filter(Boolean)
        );
      }
    }
    fetchClasses();
  }, [teacherId]);

  // Fetch students for class
  useEffect(() => {
    async function fetchStudents() {
      if (!selectedClass) return setStudents([]);
      setLoading(true);
      // Get students in selected class
      const { data: studentsData, error } = await supabase
        .from("students")
        .select("id, name, admission_number")
        .eq("class_id", selectedClass)
        .eq("is_active", true);

      if (error) {
        toast({ title: "Error", description: "Could not load students.", variant: "destructive" });
        setStudents([]);
        setAttendanceMap({});
        setLoading(false);
        return;
      }
      setStudents(studentsData || []);

      // Load existing attendance for the date+session
      const { data: attData, error: attError } = await supabase
        .from("attendance")
        .select("student_id, status, remarks")
        .eq("class_id", selectedClass)
        .eq("date", selectedDate)
        .eq("session", session);

      if (attError) {
        setAttendanceMap({});
      } else {
        // Build map: student_id -> {status, remarks}
        const attMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
        if (Array.isArray(attData)) {
          attData.forEach((a) => {
            attMap[a.student_id] = {
              status: a.status || "present",
              remarks: a.remarks || "",
            };
          });
        }
        setAttendanceMap(attMap);
      }
      setLoading(false);
    }
    fetchStudents();
  }, [selectedClass, selectedDate, session, toast]);

  // Handle status/remark changes
  function setStatus(studentId: string, status: AttendanceStatus) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  }
  function setRemarks(studentId: string, remarks: string) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  }
  async function markAllPresent() {
    setAttendanceMap((prev) => {
      const newMap: typeof prev = { ...prev };
      students.forEach((stu) => {
        newMap[stu.id] = { ...newMap[stu.id], status: "present", remarks: "" };
      });
      return newMap;
    });
    toast({ title: "Marked All Present", description: "All students set to present." });
  }

  // Save attendance
  async function handleSaveAttendance() {
    if (!selectedClass || !teacherId) {
      toast({ title: "Select class", description: "Please select a class.", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      // Prepare rows for upsert
      const today = selectedDate;
      const rows = students.map((s) => ({
        student_id: s.id,
        class_id: selectedClass,
        school_id: schoolId,
        date: today,
        session,
        status: attendanceMap[s.id]?.status || "present",
        remarks: attendanceMap[s.id]?.remarks || null,
        submitted_by: teacherId,
        submitted_at: new Date().toISOString(),
        term: "term1",
        academic_year: new Date().getFullYear().toString(),
      }));
      // Delete existing for this class/date/session
      await supabase
        .from("attendance")
        .delete()
        .eq("class_id", selectedClass)
        .eq("date", today)
        .eq("session", session);

      // Insert new
      const { error } = await supabase.from("attendance").insert(rows);

      if (error) throw error;

      toast({ title: "Attendance saved", description: "Attendance marked successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to save attendance.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
          <div className="w-full md:w-1/4">
            <label className="block mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 px-2 rounded-md border border-input w-full"
            />
          </div>
          <div className="w-full md:w-1/4">
            <label className="block mb-1">Session</label>
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger>
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4 flex gap-2">
            <Button variant="outline" type="button" onClick={markAllPresent} disabled={loading || !selectedClass}>
              Mark All Present
            </Button>
            <Button onClick={handleSaveAttendance} disabled={saving || !selectedClass || !students.length}>
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
        {/* Table */}
        <div>
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : !selectedClass ? (
            <div className="p-8 text-center text-muted-foreground">Select a class to begin.</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No students found in this class.</div>
          ) : (
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
                  const status = attendanceMap[student.id]?.status || "present";
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAttendancePanel;
