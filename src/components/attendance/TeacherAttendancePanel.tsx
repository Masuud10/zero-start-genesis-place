
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherAttendanceTable from "./TeacherAttendanceTable";
import { Student } from "./TeacherAttendanceUtils";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import AttendanceControls from "./AttendanceControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface TeacherAttendancePanelProps {
  userId: string;
  schoolId?: string;
  userRole?: string;
}

// Re-defining types here to include 'excused' and avoid touching read-only file
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  status: AttendanceStatus;
  remarks: string;
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
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Partial<AttendanceRecord>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { academicInfo, loading: academicInfoLoading, error: academicInfoError } = useCurrentAcademicInfo(schoolId);

  // Fetch classes based on user role
  useEffect(() => {
    async function fetchClasses() {
      if (!schoolId) return;
      let query;
      if (userRole === 'teacher' && userId) {
        query = supabase
          .from("teacher_classes")
          .select("class_id, classes(id, name)")
          .eq("teacher_id", userId)
          .eq("school_id", schoolId);
      } else if (userRole && ['principal', 'school_owner'].includes(userRole)) {
        query = supabase
          .from("classes")
          .select("id, name")
          .eq("school_id", schoolId);
      } else {
        return;
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({ title: "Error", description: "Failed to fetch classes.", variant: "destructive" });
      } else if (data) {
        const formattedClasses = data
          .map((item: any) => userRole === 'teacher' ? (item.classes ? { id: item.class_id, name: item.classes.name } : null) : item)
          .filter((c): c is { id: string, name: string } => c !== null);
        setClasses(formattedClasses);
        if (formattedClasses.length > 0 && !selectedClass) {
            // setSelectedClass(formattedClasses[0].id);
        }
      }
    }
    fetchClasses();
  }, [userId, schoolId, userRole, toast]);

  // Fetch students and existing attendance for class
  useEffect(() => {
    async function fetchStudentsAndAttendance() {
      if (!selectedClass) {
        setStudents([]);
        setAttendanceMap({});
        return;
      }
      setLoading(true);

      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, name, admission_number")
          .eq("class_id", selectedClass)
          .eq("is_active", true);

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        const { data: attData, error: attError } = await supabase
          .from("attendance")
          .select("student_id, status, remarks")
          .eq("class_id", selectedClass)
          .eq("date", selectedDate)
          .eq("session", session);

        if (attError) throw attError;
        
        const newAttendanceMap: Record<string, Partial<AttendanceRecord>> = {};
        if (attData) {
            for (const record of attData) {
                if(record.student_id) {
                    newAttendanceMap[record.student_id] = {
                        status: record.status as AttendanceStatus,
                        remarks: record.remarks || ""
                    };
                }
            }
        }
        setAttendanceMap(newAttendanceMap);

      } catch (err: any) {
        toast({ title: "Error", description: `Could not load class data: ${err.message}`, variant: "destructive" });
        setStudents([]);
        setAttendanceMap({});
      } finally {
        setLoading(false);
      }
    }
    fetchStudentsAndAttendance();
  }, [selectedClass, selectedDate, session, toast]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  }
  
  const setRemarks = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  }

  const handleMarkAll = (status: 'present' | 'absent') => {
    const newMap: typeof attendanceMap = {};
    students.forEach((stu) => {
      newMap[stu.id] = { ...attendanceMap[stu.id], status, remarks: status === 'present' ? '' : attendanceMap[stu.id]?.remarks || '' };
    });
    setAttendanceMap(newMap);
    toast({ title: `Marked All ${status.charAt(0).toUpperCase() + status.slice(1)}`, description: `All students set to ${status}.` });
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass || !userId || !schoolId) {
      toast({ title: "Select class", description: "Please select a class.", variant: "destructive" });
      return;
    }
    if (!academicInfo.year || !academicInfo.term) {
      toast({ title: "Academic Info Missing", description: "Current academic year or term not set. Cannot save attendance.", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      const attendanceRows = students.map((s) => ({
        student_id: s.id,
        class_id: selectedClass,
        school_id: schoolId,
        date: selectedDate,
        session,
        status: attendanceMap[s.id]?.status || "present",
        remarks: attendanceMap[s.id]?.remarks || null,
        submitted_by: userId,
        term: academicInfo.term,
        academic_year: academicInfo.year,
      }));

      const { error } = await supabase.from("attendance").upsert(attendanceRows, {
        onConflict: 'school_id,class_id,student_id,date,session',
        ignoreDuplicates: false,
      });

      if (error) throw error;

      toast({ title: "Attendance saved", description: "Attendance marked successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to save attendance: ${err.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }
  
  const attendanceStats = useMemo(() => {
    const stats: { total: number; present: number; absent: number; late: number; excused: number;[key: string]: number} = { total: students.length, present: 0, absent: 0, late: 0, excused: 0 };
    for (const student of students) {
        const status = attendanceMap[student.id]?.status ?? 'present';
        if (stats.hasOwnProperty(status)) {
            stats[status]++;
        }
    }
    return stats;
  }, [students, attendanceMap]);

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AttendanceControls
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          selectedDate={selectedDate}
          onDateChange={(e) => setSelectedDate(e.target.value)}
          session={session}
          onSessionChange={setSession}
          sessionOptions={sessionOptions}
          onMarkAll={handleMarkAll}
          onSaveAttendance={handleSaveAttendance}
          loading={loading || academicInfoLoading}
          saving={saving}
          academicInfoError={academicInfoError}
          stats={attendanceStats}
        />
        {academicInfoError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{academicInfoError}</AlertDescription>
          </Alert>
        )}
        
        <div>
          {loading || academicInfoLoading ? (
            <div className="p-8 text-center flex justify-center items-center gap-2"><Loader2 className="animate-spin h-5 w-5" />Loading students...</div>
          ) : !selectedClass ? (
            <div className="p-8 text-center text-muted-foreground">Select a class to begin marking attendance.</div>
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
