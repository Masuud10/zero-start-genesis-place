
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BulkAttendanceTable from "@/components/attendance/BulkAttendanceTable";

interface BulkAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  schoolId?: string;
}

/** Student info as required by table */
interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  rollNumber: string;
}

const sessionOptions = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
];

const BulkAttendanceModal: React.FC<BulkAttendanceModalProps> = ({ open, onClose, teacherId, schoolId }) => {
  const { toast } = useToast();
  const [classList, setClassList] = useState<{id: string, name: string}[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [sessionType, setSessionType] = useState<"morning"|"afternoon">("morning");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teacher's assigned classes
  useEffect(() => {
    if (!teacherId) return;
    supabase
      .from("teacher_classes")
      .select("class_id, classes(name)")
      .eq("teacher_id", teacherId)
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Error", description: "Failed to fetch your classes.", variant: "destructive" });
        }
        if (data) {
          setClassList(
            data
              .map((row: any) =>
                row.classes
                  ? { id: row.class_id, name: row.classes.name }
                  : null
              )
              .filter(Boolean)
          );
        }
      });
  }, [teacherId, toast]);

  // Fetch students of class when selected
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    supabase
      .from("students")
      .select("id, name, admission_number, roll_number")
      .eq("class_id", selectedClass)
      .eq("is_active", true)
      .then(({ data, error }) => {
        setIsLoading(false);
        if (error) {
          toast({ title: "Error", description: "Failed to load students for this class.", variant: "destructive" });
          setStudents([]);
          return;
        }
        setStudents(
          (data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            admissionNumber: s.admission_number,
            rollNumber: s.roll_number ?? "",
          }))
        );
      });
  }, [selectedClass, toast]);

  // Handler: Submit bulk attendance
  const handleSubmitAttendance = async (entries: { studentId: string, status: "present"|"absent"|"late", remarks?: string }[]) => {
    setIsSubmitting(true);
    try {
      // Remove existing for this class/date/session
      await supabase
        .from("attendance")
        .delete()
        .eq("class_id", selectedClass)
        .eq("date", date)
        .eq("session", sessionType);

      // Insert new rows
      const rows = entries.map(e => ({
        student_id: e.studentId,
        class_id: selectedClass,
        school_id: schoolId,
        date,
        status: e.status,
        session: sessionType,
        remarks: e.remarks || null,
        submitted_by: teacherId,
        submitted_at: new Date().toISOString(),
        term: "term1", // (could enhance this for real active term)
        academic_year: new Date().getFullYear().toString(),
      }));

      const { error } = await supabase.from("attendance").insert(rows);

      if (error) throw error;

      toast({ title: "Attendance saved", description: "Attendance has been submitted successfully." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit attendance.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mark Bulk Attendance</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classList.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-10 px-2 rounded border border-input w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Session</label>
            <Select value={sessionType} onValueChange={v => setSessionType(v as "morning"|"afternoon")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedClass && (
          <BulkAttendanceTable
            students={students}
            date={date}
            sessionType={sessionType}
            onSubmit={handleSubmitAttendance}
            isSubmitting={isSubmitting}
          />
        )}
        {!selectedClass && (
          <div className="text-center text-muted-foreground p-8">Select a class to begin.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default BulkAttendanceModal;
