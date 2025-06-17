import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import BulkGradingControls from "../grading/BulkGradingControls";
import BulkGradingSheet from "../grading/BulkGradingSheet";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface BulkGradingModalProps {
  onClose: () => void;
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
};

const BulkGradingModal: React.FC<BulkGradingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Changed state type to number | null
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<number | null>(null);

  const [grades, setGrades] = useState<
    Record<string, Record<string, GradeValue>>
  >({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const schoolId = currentSchool?.id;
  const curriculumType = currentSchool?.curriculum_type || "standard";

  useEffect(() => {
    if (!schoolId) return;
    Promise.all([
      supabase.from("classes").select("*").eq("school_id", schoolId),
      supabase
        .from("academic_terms")
        .select("*")
        .eq("school_id", schoolId)
        .order("start_date", { ascending: false }),
    ]).then(([classesRes, termsRes]) => {
      setClasses(classesRes.data || []);
      setAcademicTerms(termsRes.data || []);
      setInitialLoading(false);
    });
  }, [schoolId]);

  const fetchClassData = useCallback(async () => {
    if (!selectedClass || !schoolId) {
      setStudents([]);
      setSubjects([]);
      return;
    }
    setLoading(true);
    let subjectQuery = supabase
      .from("subjects")
      .select("*")
      .eq("class_id", selectedClass);
    if (user?.role === "teacher") {
      subjectQuery = subjectQuery.eq("teacher_id", user.id);
    }

    Promise.all([
      supabase.from("students").select("*").eq("class_id", selectedClass),
      subjectQuery,
    ]).then(([studentsRes, subjectsRes]) => {
      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setLoading(false);
    });
  }, [selectedClass, schoolId, user?.id, user?.role]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) return;
    setLoading(true);
    const { data } = await supabase
      .from("grades")
      .select("*")
      .eq("class_id", selectedClass)
      .eq("term", selectedTerm)
      .eq("exam_type", selectedExamType);

    if (data) {
      const newGrades: Record<string, Record<string, GradeValue>> = {};
      for (const grade of data) {
        if (!newGrades[grade.student_id]) {
          newGrades[grade.student_id] = {};
        }
        newGrades[grade.student_id][grade.subject_id] = {
          score: grade.score,
          letter_grade: grade.letter_grade,
          cbc_performance_level: grade.cbc_performance_level,
        };
      }
      setGrades(newGrades);
    }
    setLoading(false);
  }, [selectedClass, selectedTerm, selectedExamType]);

  useEffect(() => {
    fetchExistingGrades();
  }, [fetchExistingGrades]);

  const handleGradeChange = (
    studentId: string,
    subjectId: string,
    value: GradeValue
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { ...(prev[studentId]?.[subjectId] || {}), ...value },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Info",
        description: "Please select a class, term, and exam type.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    const gradesToUpsert = [];
    for (const studentId in grades) {
      for (const subjectId in grades[studentId]) {
        const grade = grades[studentId][subjectId];
        gradesToUpsert.push({
          school_id: schoolId,
          student_id: studentId,
          class_id: selectedClass,
          subject_id: subjectId,
          term: selectedTerm,
          exam_type: selectedExamType,
          score: grade.score ?? null,
          letter_grade: grade.letter_grade ?? null,
          cbc_performance_level: grade.cbc_performance_level ?? null,
          submitted_by: user?.id,
          status: user?.role === "teacher" ? "submitted" : "draft",
        });
      }
    }

    if (gradesToUpsert.length === 0) {
      toast({
        title: "No grades to submit",
        description: "Please enter at least one grade.",
        variant: "default",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("grades").upsert(gradesToUpsert, {
      onConflict: "school_id,student_id,subject_id,class_id,term,exam_type",
    });

    if (error) {
      toast({
        title: "Error submitting grades",
        description: error.message,
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Success",
        description: "Grades submitted successfully.",
      });
      onClose();
    }
    setLoading(false);
  };

  const canProceed =
    selectedClass !== null &&
    selectedTerm !== null &&
    selectedExamType !== null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Grade Entry</DialogTitle>
          <DialogDescription>
            Enter grades for multiple students and subjects at once. Select a
            class, term, and exam to begin.
          </DialogDescription>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <BulkGradingControls
              classes={classes}
              academicTerms={academicTerms}
              selectedClass={selectedClass}
              onClassChange={(value) => setSelectedClass(Number(value))}
              selectedTerm={selectedTerm}
              onTermChange={(value) => setSelectedTerm(Number(value))}
              selectedExamType={selectedExamType}
              onExamTypeChange={(value) => setSelectedExamType(Number(value))}
            />

            {loading && !initialLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />{" "}
                <span className="ml-2">Loading data...</span>
              </div>
            )}

            {!canProceed && (
              <div className="flex-grow flex items-center justify-center">
                <Alert className="max-w-md">
                  <AlertDescription>
                    Please make selections above to load the grading sheet.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {canProceed &&
              !loading &&
              students.length > 0 &&
              subjects.length > 0 && (
                <div className="flex-grow">
                  <BulkGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    curriculumType={curriculumType as any}
                  />
                </div>
              )}

            {canProceed &&
              !loading &&
              (students.length === 0 || subjects.length === 0) && (
                <div className="flex-grow flex items-center justify-center">
                  <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>
                      No students or subjects found for the selected class.
                      Please check class setup and subject assignments.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !canProceed}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Grades"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
