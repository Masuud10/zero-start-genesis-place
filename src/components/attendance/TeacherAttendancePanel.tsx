
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherAttendanceTable from "./TeacherAttendanceTable";
import { Student, AttendanceStatus, AttendanceRecord, validStatus } from "./TeacherAttendanceUtils";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import AttendanceControls from "./AttendanceControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TeacherAttendancePanelProps {
  userId: string;
  schoolId?: string;
  userRole?: string;
}

const sessionOptions = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
];

const TeacherAttendancePanel: React.FC<TeacherAttendancePanelProps> = ({ userId, schoolId, userRole }) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState<string>("morning");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { academicInfo, loading: academicInfoLoading, error: academicInfoError } = useCurrentAcademicInfo(schoolId);

  // Fetch classes based on user role
  useEffect(() => {
    async function fetchClasses() {
      if (userRole === 'teacher' && userId && schoolId) {
        const { data, error } = await supabase
          .from("teacher_classes")
          .select("class_id, classes(id, name)")
          .eq("teacher_id", userId)
          .eq("school_id", schoolId);
        
        if (error) {
          toast({ title: "Error", description: "Failed to fetch teacher's classes.", variant: "destructive" });
        } else if (data) {
          const formattedClasses = data
            .map(tc => tc.classes ? { id: tc.class_id, name: tc.classes.name } : null)
            .filter((c): c is { id: string, name: string } => c !== null);
          setClasses(formattedClasses);
        }
      } else if (userRole !== 'teacher' && schoolId) { // For principal or other school-level admins
        const { data, error } = await supabase
          .from("classes")
          .select("id, name")
          .eq("school_id", schoolId);
        
        if (error) {
          toast({ title: "Error", description: "Failed to fetch classes.", variant: "destructive" });
        } else if (data) {
          setClasses(data);
        }
      }
    }
    fetchClasses();
  }, [userId, schoolId, userRole, toast]);

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
        const attMap: Record<string, AttendanceRecord> = {};
        if (Array.isArray(attData)) {
          attData.forEach((a) => {
            attMap[a.student_id] = {
              status: validStatus(a.status),
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
    if (!selectedClass || !userId) {
      toast({ title: "Select class", description: "Please select a class.", variant: "destructive" });
      return;
    }
    if (!academicInfo.year || !academicInfo.term) {
      toast({ title: "Academic Info Missing", description: "Current academic year or term not set. Cannot save attendance.", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      const today = selectedDate;
      const rows = students.map((s) => ({
        student_id: s.id,
        class_id: selectedClass,
        school_id: schoolId,
        date: today,
        session,
        status: attendanceMap[s.id]?.status || "present",
        remarks: attendanceMap[s.id]?.remarks || null,
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
        term: academicInfo.term,
        academic_year: academicInfo.year,
      }));

      await supabase
        .from("attendance")
        .delete()
        .eq("class_id", selectedClass)
        .eq("date", today)
        .eq("session", session);

      const { error } = await supabase.from("attendance").insert(rows);

      if (error) throw error;

      toast({ title: "Attendance saved", description: "Attendance marked successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to save attendance: ${err.message}`, variant: "destructive" });
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
        <AttendanceControls
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedDate={selectedDate}
          onDateChange={(e) => setSelectedDate(e.target.value)}
          session={session}
          onSessionChange={setSession}
          sessionOptions={sessionOptions}
          onMarkAllPresent={markAllPresent}
          onSaveAttendance={handleSaveAttendance}
          loading={loading || academicInfoLoading}
          saving={saving}
          academicInfoError={academicInfoError}
          studentCount={students.length}
        />
        {academicInfoError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{academicInfoError}</AlertDescription>
          </Alert>
        )}
        {/* Table */}
        <div>
          {loading || academicInfoLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : !selectedClass ? (
            <div className="p-8 text-center text-muted-foreground">Select a class to begin.</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No students found in this class.</div>
          ) : (
            <TeacherAttendanceTable
              students={students}
              attendanceMap={attendanceMap}
              setStatus={setStatus}
              setRemarks={setRemarks}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAttendancePanel;
