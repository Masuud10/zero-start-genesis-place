import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  admission_number?: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface GradeValue {
  student_id: string;
  subject_id: string;
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  teacher_remarks?: string;
  status?: string;
  marks?: number;
}

interface CleanGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeValue>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: GradeValue
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
  curriculumType?: string;
  // New props for displaying names
  className?: string;
  termName?: string;
  academicYearName?: string;
}

const CBC_PERFORMANCE_LEVELS = [
  { level: "EM", name: "Emerging", color: "bg-red-100 text-red-800" },
  { level: "AP", name: "Approaching", color: "bg-yellow-100 text-yellow-800" },
  { level: "PR", name: "Proficient", color: "bg-blue-100 text-blue-800" },
  { level: "EX", name: "Exemplary", color: "bg-green-100 text-green-800" },
];

export const CleanGradingSheet: React.FC<CleanGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType,
  isPrincipal = false,
  isViewOnly = false,
  curriculumType = "standard",
  className,
  termName,
  academicYearName,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Convert marks to performance level for CBC
  const getPerformanceLevelFromMarks = (marks: number): string => {
    if (marks >= 80) return "EX";
    if (marks >= 60) return "PR";
    if (marks >= 40) return "AP";
    return "EM";
  };

  // Get performance level color
  const getPerformanceLevelColor = (level: string): string => {
    const levelInfo = CBC_PERFORMANCE_LEVELS.find((l) => l.level === level);
    return levelInfo?.color || "bg-gray-100 text-gray-800";
  };

  // Handle grade change
  const handleGradeChange = (
    studentId: string,
    subjectId: string,
    field: keyof GradeValue,
    value: string | number | null
  ) => {
    const currentGrade = grades[studentId]?.[subjectId] || {
      student_id: studentId,
      subject_id: subjectId,
      score: null,
      letter_grade: null,
      cbc_performance_level: null,
      percentage: null,
      teacher_remarks: "",
      status: "draft",
      marks: 0,
    };

    const updatedGrade = {
      ...currentGrade,
      [field]: value,
    };

    // Auto-calculate performance level for CBC when marks change
    if (
      field === "marks" &&
      curriculumType === "cbc" &&
      typeof value === "number"
    ) {
      updatedGrade.cbc_performance_level = getPerformanceLevelFromMarks(value);
    }

    // Auto-calculate percentage for standard curriculum
    if (
      field === "score" &&
      curriculumType === "standard" &&
      typeof value === "number"
    ) {
      updatedGrade.percentage = value ? Math.round((value / 100) * 100) : null;
    }

    onGradeChange(studentId, subjectId, updatedGrade);
  };

  // Save grades
  const handleSave = async () => {
    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are selected.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const gradesToSave = [];

      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (
            grade.score !== null ||
            grade.marks !== null ||
            grade.cbc_performance_level
          ) {
            gradesToSave.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              academic_year: new Date().getFullYear().toString(),
              score: grade.score,
              marks: grade.marks,
              letter_grade: grade.letter_grade,
              cbc_performance_level: grade.cbc_performance_level,
              percentage: grade.percentage,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              status: "draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      if (gradesToSave.length > 0) {
        const { error } = await supabase.from("grades").upsert(gradesToSave, {
          onConflict: "school_id,student_id,class_id,subject_id,term,exam_type",
        });

        if (error) throw error;

        toast({
          title: "Draft Saved",
          description: `${gradesToSave.length} grades have been saved as draft. You can continue editing or submit for approval when ready.`,
        });
      }
    } catch (error: unknown) {
      console.error("Error saving grades:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save grades",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit grades
  const handleSubmit = async () => {
    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are selected.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are any grades to submit
    const hasAnyGrades = Object.values(grades).some((studentGrades) =>
      Object.values(studentGrades).some(
        (grade) =>
          grade.score !== null ||
          grade.marks !== null ||
          grade.cbc_performance_level !== null
      )
    );

    if (!hasAnyGrades) {
      toast({
        title: "No Grades to Submit",
        description:
          "Please enter at least one grade before submitting for approval.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const gradesToSubmit = [];

      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (
            grade.score !== null ||
            grade.marks !== null ||
            grade.cbc_performance_level !== null
          ) {
            gradesToSubmit.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              academic_year: new Date().getFullYear().toString(),
              score: grade.score,
              marks: grade.marks,
              letter_grade: grade.letter_grade,
              cbc_performance_level: grade.cbc_performance_level,
              percentage: grade.percentage,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              submitted_by: user?.id,
              submitted_at: new Date().toISOString(),
              status: "submitted",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      if (gradesToSubmit.length > 0) {
        const { error } = await supabase.from("grades").upsert(gradesToSubmit, {
          onConflict: "school_id,student_id,class_id,subject_id,term,exam_type",
        });

        if (error) throw error;

        toast({
          title: "Grades Submitted for Approval",
          description: `${gradesToSubmit.length} grades have been submitted to the principal for approval. You will be notified once they are reviewed.`,
        });

        // Log the submission for audit purposes
        console.log("Grades submitted for approval:", {
          count: gradesToSubmit.length,
          classId: selectedClass,
          term: selectedTerm,
          examType: selectedExamType,
          teacherId: user?.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      console.error("Error submitting grades:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit grades",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (students.length === 0 || subjects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <p>No students or subjects available for grading.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Academic Information Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-sm">
                {academicYearName && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">
                      Academic Year:
                    </span>
                    <span className="text-blue-700">{academicYearName}</span>
                  </div>
                )}
                {termName && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Term:</span>
                    <span className="text-blue-700">{termName}</span>
                  </div>
                )}
                {className && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Class:</span>
                    <span className="text-blue-700">{className}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="font-medium text-blue-900">Exam:</span>
                  <span className="text-blue-700">{selectedExamType}</span>
                </div>
              </div>
              <div className="text-xs text-blue-600">
                {students.length} students • {subjects.length} subjects
              </div>
            </div>
            {!isReadOnly && !isViewOnly && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white hover:bg-blue-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit for Approval
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clean Grading Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Student</TableHead>
                  {subjects.map((subject) => (
                    <TableHead
                      key={subject.id}
                      className="text-center min-w-32"
                    >
                      <div className="font-medium">{subject.name}</div>
                      {subject.code && (
                        <div className="text-xs text-gray-500 font-normal">
                          {subject.code}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      {student.admission_number && (
                        <div className="text-sm text-gray-500">
                          {student.admission_number}
                        </div>
                      )}
                    </TableCell>
                    {subjects.map((subject) => {
                      const grade = grades[student.id]?.[subject.id] || {
                        student_id: student.id,
                        subject_id: subject.id,
                        score: null,
                        marks: 0,
                        cbc_performance_level: "EM",
                        teacher_remarks: "",
                        status: "draft",
                      };

                      return (
                        <TableCell key={subject.id} className="text-center">
                          <div className="space-y-2">
                            {/* Input Field */}
                            {curriculumType === "cbc" ? (
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={grade.marks || 0}
                                  onChange={(e) => {
                                    const marks = parseInt(e.target.value) || 0;
                                    handleGradeChange(
                                      student.id,
                                      subject.id,
                                      "marks",
                                      marks
                                    );
                                  }}
                                  disabled={isReadOnly || isViewOnly}
                                  className="w-16 text-center"
                                  placeholder="0-100"
                                />
                                <Badge
                                  className={getPerformanceLevelColor(
                                    grade.cbc_performance_level || "EM"
                                  )}
                                >
                                  {grade.cbc_performance_level || "EM"}
                                </Badge>
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={grade.score || ""}
                                onChange={(e) => {
                                  const score =
                                    parseInt(e.target.value) || null;
                                  handleGradeChange(
                                    student.id,
                                    subject.id,
                                    "score",
                                    score
                                  );
                                }}
                                disabled={isReadOnly || isViewOnly}
                                className="w-16 text-center"
                                placeholder="0-100"
                              />
                            )}

                            {/* Remarks */}
                            <Textarea
                              value={grade.teacher_remarks || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.id,
                                  subject.id,
                                  "teacher_remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Remarks..."
                              disabled={isReadOnly || isViewOnly}
                              className="w-full text-xs min-h-[40px] resize-none"
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
