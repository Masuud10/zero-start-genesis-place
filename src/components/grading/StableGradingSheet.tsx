import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Loader2,
  Save,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Send,
  FileText,
  Download,
  Printer,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Keyboard,
  Info,
} from "lucide-react";
import {
  detectCurriculumType,
  getCurriculumDisplayName,
  getCurriculumBadgeColor,
} from "@/utils/curriculum-detector";
import {
  validateCurriculumType,
  getCurriculumInfo,
} from "@/utils/curriculum-validator";
import { CBCGradingSheet } from "./CBCGradingSheet";
import { IGCSEGradingSheet } from "./IGCSEGradingSheet";
import { EnhancedGradingSheet } from "./EnhancedGradingSheet";

interface Student {
  id: string;
  name: string;
  admission_number?: string;
  roll_number?: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface GradeValue {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  strand_scores?: Record<string, string>;
  teacher_remarks?: string;
  assessment_type?: string;
  performance_level?: "EM" | "AP" | "PR" | "EX";
  status?: string;
  is_locked?: boolean;
}

interface StableGradingSheetProps {
  classId: string;
  term: string;
  examType: string;
  onSubmissionSuccess?: () => void;
  isReadOnly?: boolean;
  isPrincipal?: boolean;
}

export const StableGradingSheet: React.FC<StableGradingSheetProps> = ({
  classId,
  term,
  examType,
  onSubmissionSuccess,
  isReadOnly = false,
  isPrincipal = false,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
  } = useClassCurriculum(classId);
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<
    Record<string, Record<string, GradeValue>>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [focusedCell, setFocusedCell] = useState<{
    studentId: string;
    subjectId: string;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    subjectId: string;
  } | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  // Refs for keyboard navigation
  const cellRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement>
  >({});
  const tableRef = useRef<HTMLTableElement>(null);

  // Determine if user is principal
  const isPrincipalUser =
    isPrincipal || user?.role === "principal" || user?.role === "edufam_admin";

  // Determine if view-only mode should be enforced
  const isViewOnly =
    isReadOnly ||
    grades[Object.keys(grades)[0]]?.[
      Object.keys(grades[Object.keys(grades)[0]] || {})[0]
    ]?.status === "released";

  // Load grading data
  const loadGradingData = useCallback(async () => {
    if (!schoolId || !classId || !term || !examType) {
      console.log("❌ StableGradingSheet: Missing required parameters", {
        schoolId: !!schoolId,
        classId: !!classId,
        term: !!term,
        examType: !!examType,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🎓 StableGradingSheet: Loading data for", {
        classId,
        term,
        examType,
        curriculumType,
      });

      // Basic access validation
      if (!user?.id || !schoolId) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this data",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load students in the class
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name, admission_number, roll_number")
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("is_active", true)
        .order("name");

      if (studentsError) {
        console.error("❌ Error loading students:", studentsError);
        throw studentsError;
      }

      if (!studentsData || studentsData.length === 0) {
        console.warn("⚠️ No students found in class:", classId);
        setStudents([]);
        setSubjects([]);
        setGrades({});
        setDataLoaded(true);
        setLoading(false);
        return;
      }

      // Load subjects based on user role and curriculum
      let subjectsList: Subject[] = [];

      if (isPrincipalUser) {
        // Principals can see all subjects for the class
        const { data: classSubjectsData, error: classSubjectsError } =
          await supabase
            .from("class_subjects")
            .select("subjects(id, name, code)")
            .eq("class_id", classId)
            .eq("is_active", true);

        if (!classSubjectsError && classSubjectsData) {
          subjectsList =
            classSubjectsData
              ?.map((cs: { subjects: Subject }) => cs.subjects)
              .filter(Boolean) || [];
        }
      } else {
        // Teachers can only see their assigned subjects
        const { data: teacherSubjectsData, error: teacherSubjectsError } =
          await supabase
            .from("subject_teacher_assignments")
            .select("subject:subjects(id, name, code)")
            .eq("teacher_id", user?.id)
            .eq("class_id", classId)
            .eq("is_active", true);

        if (!teacherSubjectsError && teacherSubjectsData) {
          subjectsList =
            teacherSubjectsData
              ?.map((ts: { subject: Subject }) => ts.subject)
              .filter(Boolean) || [];
        }
      }

      // Load existing grades
      const { data: existingGrades, error: gradesError } = await supabase
        .from("grades")
        .select("*")
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .eq("term", term)
        .eq("exam_type", examType);

      if (gradesError) {
        console.error("❌ Error loading grades:", gradesError);
        throw gradesError;
      }

      // Initialize grades structure
      const gradesStructure: Record<string, Record<string, GradeValue>> = {};
      studentsData.forEach((student) => {
        gradesStructure[student.id] = {};
        subjectsList.forEach((subject) => {
          const existingGrade = existingGrades?.find(
            (g) => g.student_id === student.id && g.subject_id === subject.id
          );
          gradesStructure[student.id][subject.id] = {
            score: existingGrade?.score || null,
            letter_grade: existingGrade?.letter_grade || null,
            cbc_performance_level: existingGrade?.cbc_performance_level || null,
            percentage: existingGrade?.percentage || null,
            strand_scores: existingGrade?.strand_scores || {},
            teacher_remarks: existingGrade?.teacher_remarks || "",
            assessment_type: existingGrade?.assessment_type || examType,
            performance_level: existingGrade?.performance_level || null,
            status: existingGrade?.status || "draft",
            is_locked:
              existingGrade?.status === "released" ||
              existingGrade?.status === "approved",
          };
        });
      });

      setStudents(studentsData);
      setSubjects(subjectsList);
      setGrades(gradesStructure);
      setDataLoaded(true);

      // Log data load
      console.log("Data loaded:", {
        classId,
        term,
        examType,
        studentCount: studentsData.length,
        subjectCount: subjectsList.length,
      });
    } catch (error) {
      console.error("❌ Error loading grading data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load grading data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    schoolId,
    classId,
    term,
    examType,
    curriculumType,
    user?.id,
    isPrincipalUser,
    toast,
  ]);

  useEffect(() => {
    loadGradingData();
  }, [loadGradingData]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && dataLoaded) {
      const autoSaveTimer = setTimeout(() => {
        saveAsDraft();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, autoSaveEnabled, dataLoaded]);

  // Handle grade change
  const handleGradeChange = useCallback(
    (studentId: string, subjectId: string, value: Partial<GradeValue>) => {
      if (isViewOnly) return;

      setGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subjectId]: {
            ...prev[studentId]?.[subjectId],
            ...value,
          },
        },
      }));
      setHasUnsavedChanges(true);
    },
    [isViewOnly]
  );

  // Save as draft
  const saveAsDraft = useCallback(async () => {
    if (!schoolId || !classId || !term || !examType || !hasUnsavedChanges)
      return;

    try {
      setSaving(true);
      console.log("💾 Saving grades as draft...");

      const gradesToSave = Object.entries(grades).flatMap(
        ([studentId, studentGrades]) =>
          Object.entries(studentGrades).map(([subjectId, gradeData]) => ({
            school_id: schoolId,
            class_id: classId,
            student_id: studentId,
            subject_id: subjectId,
            term,
            exam_type: examType,
            score: gradeData.score,
            letter_grade: gradeData.letter_grade,
            cbc_performance_level: gradeData.cbc_performance_level,
            percentage: gradeData.percentage,
            strand_scores: gradeData.strand_scores,
            teacher_remarks: gradeData.teacher_remarks,
            assessment_type: gradeData.assessment_type,
            performance_level: gradeData.performance_level,
            status: "draft",
            submitted_by: user?.id,
            curriculum_type: curriculumType,
          }))
      );

      // Use upsert to handle both insert and update
      const { error } = await supabase.from("grades").upsert(gradesToSave, {
        onConflict: "school_id,class_id,student_id,subject_id,term,exam_type",
      });

      if (error) throw error;

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaving(false);

      toast({
        title: "Grades Saved",
        description: "Grades have been saved as draft successfully.",
      });

      // Log save action
      console.log("Draft saved:", {
        classId,
        term,
        examType,
        gradeCount: gradesToSave.length,
      });
    } catch (error) {
      console.error("❌ Error saving grades:", error);
      setSaving(false);
      toast({
        title: "Save Failed",
        description: "Failed to save grades. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    schoolId,
    classId,
    term,
    examType,
    grades,
    hasUnsavedChanges,
    user?.id,
    curriculumType,
    toast,
  ]);

  // Submit grades for approval
  const handleSubmitGrades = useCallback(async () => {
    if (!schoolId || !classId || !term || !examType) return;

    try {
      setSubmitting(true);
      console.log("📤 Submitting grades for approval...");

      // Validate all grades have been entered
      const hasEmptyGrades = Object.values(grades).some((studentGrades) =>
        Object.values(studentGrades).some(
          (grade) =>
            grade.score === null &&
            grade.cbc_performance_level === null &&
            grade.performance_level === null
        )
      );

      if (hasEmptyGrades) {
        toast({
          title: "Incomplete Grades",
          description: "Please fill in all grades before submitting.",
          variant: "destructive",
        });
        return;
      }

      const gradesToSubmit = Object.entries(grades).flatMap(
        ([studentId, studentGrades]) =>
          Object.entries(studentGrades).map(([subjectId, gradeData]) => ({
            school_id: schoolId,
            class_id: classId,
            student_id: studentId,
            subject_id: subjectId,
            term,
            exam_type: examType,
            score: gradeData.score,
            letter_grade: gradeData.letter_grade,
            cbc_performance_level: gradeData.cbc_performance_level,
            percentage: gradeData.percentage,
            strand_scores: gradeData.strand_scores,
            teacher_remarks: gradeData.teacher_remarks,
            assessment_type: gradeData.assessment_type,
            performance_level: gradeData.performance_level,
            status: "submitted",
            submitted_by: user?.id,
            submitted_at: new Date().toISOString(),
            curriculum_type: curriculumType,
          }))
      );

      const { error } = await supabase.from("grades").upsert(gradesToSubmit, {
        onConflict: "school_id,class_id,student_id,subject_id,term,exam_type",
      });

      if (error) throw error;

      setHasUnsavedChanges(false);
      setSubmitting(false);

      toast({
        title: "Grades Submitted",
        description: "Grades have been submitted for principal approval.",
      });

      // Log submission
      console.log("Grades submitted:", {
        classId,
        term,
        examType,
        gradeCount: gradesToSubmit.length,
      });

      onSubmissionSuccess?.();
    } catch (error) {
      console.error("❌ Error submitting grades:", error);
      setSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "Failed to submit grades. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    schoolId,
    classId,
    term,
    examType,
    grades,
    user?.id,
    curriculumType,
    toast,
    onSubmissionSuccess,
  ]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, studentId: string, subjectId: string) => {
      const cellKey = `${studentId}-${subjectId}`;
      const currentCell = cellRefs.current[cellKey];

      if (!currentCell) return;

      switch (e.key) {
        case "Tab": {
          e.preventDefault();
          const allCells = Object.keys(cellRefs.current);
          const currentIndex = allCells.indexOf(cellKey);
          const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;

          if (nextIndex >= 0 && nextIndex < allCells.length) {
            const nextCell = cellRefs.current[allCells[nextIndex]];
            nextCell?.focus();
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (
            editingCell?.studentId === studentId &&
            editingCell?.subjectId === subjectId
          ) {
            setEditingCell(null);
            // Move to next cell
            const allCells = Object.keys(cellRefs.current);
            const currentIndex = allCells.indexOf(cellKey);
            const nextIndex = currentIndex + 1;

            if (nextIndex < allCells.length) {
              const nextCell = cellRefs.current[allCells[nextIndex]];
              nextCell?.focus();
            }
          } else {
            setEditingCell({ studentId, subjectId });
          }
          break;
        }
        case "Escape": {
          setEditingCell(null);
          break;
        }
      }
    },
    [editingCell]
  );

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    try {
      setExportLoading(true);

      // Create PDF content
      const pdfContent = generatePDFContent();

      // Use browser's print functionality for PDF generation
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

      // Log export action
      console.log("PDF exported:", {
        classId,
        term,
        examType,
        studentCount: students.length,
        subjectCount: subjects.length,
      });
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  }, [
    students,
    subjects,
    grades,
    classId,
    term,
    examType,
    curriculumType,
    schoolId,
    toast,
  ]);

  // Print sheet
  const printSheet = useCallback(async () => {
    try {
      setPrintLoading(true);

      const printContent = generatePrintContent();

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "Print",
        description: "Print dialog opened.",
      });

      // Log print action
      console.log("Sheet printed:", {
        classId,
        term,
        examType,
      });
    } catch (error) {
      console.error("❌ Error printing:", error);
      toast({
        title: "Print Failed",
        description: "Failed to print. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPrintLoading(false);
    }
  }, [
    students,
    subjects,
    grades,
    classId,
    term,
    examType,
    curriculumType,
    schoolId,
    toast,
  ]);

  // Generate PDF content
  const generatePDFContent = useCallback(() => {
    const curriculumInfo = getCurriculumInfo(curriculumType);
    const currentDate = new Date().toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grade Sheet - ${classId} - ${term} ${examType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .school-info { margin-bottom: 20px; }
            .grade-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .grade-table th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Grade Sheet</h1>
            <div class="school-info">
              <p><strong>Class:</strong> ${classId}</p>
              <p><strong>Term:</strong> ${term}</p>
              <p><strong>Exam Type:</strong> ${examType}</p>
              <p><strong>Curriculum:</strong> ${curriculumInfo.displayName}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
              <p><strong>Teacher:</strong> ${user?.name || "N/A"}</p>
            </div>
          </div>
          
          <table class="grade-table">
            <thead>
              <tr>
                <th>Student</th>
                ${subjects
                  .map((subject) => `<th>${subject.name}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${students
                .map(
                  (student) => `
                <tr>
                  <td>${student.name}</td>
                  ${subjects
                    .map((subject) => {
                      const grade = grades[student.id]?.[subject.id];
                      const gradeValue =
                        grade?.score ||
                        grade?.cbc_performance_level ||
                        grade?.performance_level ||
                        "N/A";
                      return `<td>${gradeValue}</td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Powered by Edufam</p>
          </div>
        </body>
      </html>
    `;
  }, [
    students,
    subjects,
    grades,
    classId,
    term,
    examType,
    curriculumType,
    user?.name,
  ]);

  // Generate print content
  const generatePrintContent = useCallback(() => {
    const curriculumInfo = getCurriculumInfo(curriculumType);
    const currentDate = new Date().toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grade Sheet - ${classId} - ${term} ${examType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .school-info { margin-bottom: 20px; }
            .grade-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .grade-table th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Grade Sheet</h1>
            <div class="school-info">
              <p><strong>Class:</strong> ${classId}</p>
              <p><strong>Term:</strong> ${term}</p>
              <p><strong>Exam Type:</strong> ${examType}</p>
              <p><strong>Curriculum:</strong> ${curriculumInfo.displayName}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
              <p><strong>Teacher:</strong> ${user?.name || "N/A"}</p>
            </div>
          </div>
          
          <table class="grade-table">
            <thead>
              <tr>
                <th>Student</th>
                ${subjects
                  .map((subject) => `<th>${subject.name}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${students
                .map(
                  (student) => `
                <tr>
                  <td>${student.name}</td>
                  ${subjects
                    .map((subject) => {
                      const grade = grades[student.id]?.[subject.id];
                      const gradeValue =
                        grade?.score ||
                        grade?.cbc_performance_level ||
                        grade?.performance_level ||
                        "N/A";
                      return `<td>${gradeValue}</td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Powered by Edufam</p>
          </div>
        </body>
      </html>
    `;
  }, [
    students,
    subjects,
    grades,
    classId,
    term,
    examType,
    curriculumType,
    user?.name,
  ]);

  // Render grading sheet based on curriculum type
  const renderGradingSheet = () => {
    switch (curriculumType) {
      case "cbc":
        return (
          <CBCGradingSheet
            students={students}
            subjects={subjects}
            grades={grades}
            onGradeChange={handleGradeChange}
            isReadOnly={isViewOnly}
            selectedClass={classId}
            selectedTerm={term}
            selectedExamType={examType}
            isPrincipal={isPrincipalUser}
            isViewOnly={isViewOnly}
            cellRefs={cellRefs}
            onKeyDown={handleKeyDown}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        );
      case "igcse":
        return (
          <IGCSEGradingSheet
            students={students}
            subjects={subjects}
            grades={grades}
            onGradeChange={handleGradeChange}
            isReadOnly={isViewOnly}
            selectedClass={classId}
            selectedTerm={term}
            selectedExamType={examType}
            isPrincipal={isPrincipalUser}
            isViewOnly={isViewOnly}
            cellRefs={cellRefs}
            onKeyDown={handleKeyDown}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        );
      default:
        return (
          <EnhancedGradingSheet
            students={students}
            subjects={subjects}
            grades={grades}
            onGradeChange={handleGradeChange}
            curriculumType={curriculumType}
            isReadOnly={isViewOnly}
            selectedClass={classId}
            selectedTerm={term}
            selectedExamType={examType}
            isPrincipal={isPrincipalUser}
            isViewOnly={isViewOnly}
            cellRefs={cellRefs}
            onKeyDown={handleKeyDown}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        );
    }
  };

  // Show loading state
  if (loading || curriculumLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading grading sheet...</span>
        </CardContent>
      </Card>
    );
  }

  // Show curriculum error
  if (curriculumError) {
    return (
      <Card className="h-full">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Curriculum Error</AlertTitle>
            <AlertDescription>{curriculumError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {getCurriculumDisplayName(curriculumType)} Grade Sheet
            </CardTitle>
            <Badge className={getCurriculumBadgeColor(curriculumType)}>
              {curriculumType.toUpperCase()}
            </Badge>
            {isViewOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Read Only
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="flex items-center gap-1"
            >
              {autoSaveEnabled ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              Auto-save {autoSaveEnabled ? "On" : "Off"}
            </Button>

            {/* Keyboard shortcuts help */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="flex items-center gap-1"
            >
              <Keyboard className="h-3 w-3" />
              Shortcuts
            </Button>

            {/* Export to PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={exportLoading}
              className="flex items-center gap-1"
            >
              {exportLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              Export PDF
            </Button>

            {/* Print */}
            <Button
              variant="outline"
              size="sm"
              onClick={printSheet}
              disabled={printLoading}
              className="flex items-center gap-1"
            >
              {printLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Printer className="h-3 w-3" />
              )}
              Print
            </Button>

            {/* Save button */}
            {!isViewOnly && (
              <Button
                size="sm"
                onClick={saveAsDraft}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-1"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Save Draft
              </Button>
            )}

            {/* Submit button */}
            {!isViewOnly && !isPrincipalUser && (
              <Button
                size="sm"
                onClick={handleSubmitGrades}
                disabled={submitting || !hasUnsavedChanges}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Submit for Approval
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status information */}
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p>
            <strong>Students:</strong> {students.length}
          </p>
          <p>
            <strong>Subjects:</strong> {subjects.length}
          </p>
          <p>
            <strong>Curriculum:</strong>{" "}
            {getCurriculumDisplayName(curriculumType)}
          </p>
          {lastSaved && (
            <p className="text-blue-600">
              <strong>Last saved:</strong> {lastSaved.toLocaleTimeString()}
            </p>
          )}
          {hasUnsavedChanges && (
            <p className="text-orange-600">
              <strong>⚠️ Unsaved changes</strong>
            </p>
          )}
          {saving && (
            <p className="text-blue-600">
              <strong>Saving...</strong>
            </p>
          )}
        </div>

        {/* Keyboard shortcuts help */}
        {showKeyboardShortcuts && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Keyboard Shortcuts</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Tab:</strong> Move to next cell
                </div>
                <div>
                  <strong>Shift+Tab:</strong> Move to previous cell
                </div>
                <div>
                  <strong>Enter:</strong> Edit cell / Move to next row
                </div>
                <div>
                  <strong>Escape:</strong> Cancel editing
                </div>
                <div>
                  <strong>Ctrl+S:</strong> Save draft
                </div>
                <div>
                  <strong>Ctrl+Enter:</strong> Submit grades
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Grading sheet */}
        <div className="overflow-x-auto">{renderGradingSheet()}</div>
      </CardContent>
    </Card>
  );
};
