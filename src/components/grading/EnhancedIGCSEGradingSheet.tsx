import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Calculator,
  BookOpen,
  Target,
  TrendingUp,
  AlertTriangle,
  Info,
  Save,
  Send,
  Download,
  Printer,
  Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";

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

interface IGCSEGradeData {
  student_id?: string;
  subject_id?: string;
  coursework_score?: number; // Coursework component
  exam_score?: number; // Examination component
  total_score?: number; // calculated total
  percentage?: number; // percentage score
  letter_grade?: "A*" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "U"; // IGCSE letter grade
  teacher_remarks?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  component_scores?: Record<string, number>; // individual component scores
}

interface EnhancedIGCSEGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, IGCSEGradeData>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: IGCSEGradeData
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
}

// IGCSE Grade Boundaries (default)
const DEFAULT_IGCSE_GRADE_BOUNDARIES = {
  "A*": 90,
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40,
  F: 30,
  G: 20,
  U: 0,
};

// IGCSE Grade Colors
const IGCSE_GRADE_COLORS = {
  "A*": "bg-purple-100 text-purple-800 border-purple-200",
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200",
  D: "bg-orange-100 text-orange-800 border-orange-200",
  E: "bg-red-100 text-red-800 border-red-200",
  F: "bg-red-100 text-red-800 border-red-200",
  G: "bg-red-100 text-red-800 border-red-200",
  U: "bg-gray-100 text-gray-800 border-gray-200",
};

// Default IGCSE subject components
const DEFAULT_IGCSE_COMPONENTS = {
  Mathematics: ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  "English Language": ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  "English Literature": ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  Biology: ["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "Paper 6"],
  Chemistry: ["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "Paper 6"],
  Physics: ["Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5", "Paper 6"],
  History: ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  Geography: ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  Economics: ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  "Business Studies": ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  "Computer Science": ["Paper 1", "Paper 2", "Paper 3", "Paper 4"],
  "Art & Design": ["Component 1", "Component 2"],
  Music: ["Component 1", "Component 2"],
  "Physical Education": ["Component 1", "Component 2"],
  default: ["Coursework", "Examination"],
};

export const EnhancedIGCSEGradingSheet: React.FC<
  EnhancedIGCSEGradingSheetProps
> = ({
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
}) => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState(isReadOnly || isViewOnly);
  const [showComponents, setShowComponents] = useState(false);
  const [selectedSubjectForComponents, setSelectedSubjectForComponents] =
    useState<string>("");
  const [gradeBoundaries, setGradeBoundaries] = useState(
    DEFAULT_IGCSE_GRADE_BOUNDARIES
  );

  // Calculate IGCSE letter grade based on percentage
  const calculateIGCSEGrade = (
    percentage: number
  ): "A*" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "U" => {
    if (percentage >= gradeBoundaries["A*"]) return "A*";
    if (percentage >= gradeBoundaries["A"]) return "A";
    if (percentage >= gradeBoundaries["B"]) return "B";
    if (percentage >= gradeBoundaries["C"]) return "C";
    if (percentage >= gradeBoundaries["D"]) return "D";
    if (percentage >= gradeBoundaries["E"]) return "E";
    if (percentage >= gradeBoundaries["F"]) return "F";
    if (percentage >= gradeBoundaries["G"]) return "G";
    return "U";
  };

  // Calculate total score from coursework and exam
  const calculateTotalScore = (coursework: number, exam: number): number => {
    // Default weighting: 30% coursework, 70% exam
    const courseworkWeighted = coursework * 0.3;
    const examWeighted = exam * 0.7;
    return Math.round(courseworkWeighted + examWeighted);
  };

  // Handle coursework score change
  const handleCourseworkScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (viewMode) return;

    const courseworkScore =
      value === ""
        ? undefined
        : Math.min(100, Math.max(0, parseFloat(value) || 0));
    const currentGrade = grades[studentId]?.[subjectId] || {};
    const examScore = currentGrade.exam_score || 0;

    const totalScore =
      courseworkScore !== undefined
        ? calculateTotalScore(courseworkScore, examScore)
        : undefined;
    const percentage = totalScore;
    const letterGrade =
      percentage !== undefined ? calculateIGCSEGrade(percentage) : undefined;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      coursework_score: courseworkScore,
      total_score: totalScore,
      percentage,
      letter_grade: letterGrade,
    });
  };

  // Handle exam score change
  const handleExamScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (viewMode) return;

    const examScore =
      value === ""
        ? undefined
        : Math.min(100, Math.max(0, parseFloat(value) || 0));
    const currentGrade = grades[studentId]?.[subjectId] || {};
    const courseworkScore = currentGrade.coursework_score || 0;

    const totalScore =
      examScore !== undefined
        ? calculateTotalScore(courseworkScore, examScore)
        : undefined;
    const percentage = totalScore;
    const letterGrade =
      percentage !== undefined ? calculateIGCSEGrade(percentage) : undefined;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      exam_score: examScore,
      total_score: totalScore,
      percentage,
      letter_grade: letterGrade,
    });
  };

  // Handle letter grade override (for principals)
  const handleLetterGradeChange = (
    studentId: string,
    subjectId: string,
    value: "A*" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "U"
  ) => {
    if (viewMode || !isPrincipal) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      letter_grade: value,
    });
  };

  // Handle teacher remarks
  const handleRemarksChange = (
    studentId: string,
    subjectId: string,
    remarks: string
  ) => {
    if (viewMode) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      teacher_remarks: remarks,
    });
  };

  // Get subject components
  const getSubjectComponents = (subjectName: string): string[] => {
    const normalizedSubject = subjectName.toLowerCase();
    for (const [key, components] of Object.entries(DEFAULT_IGCSE_COMPONENTS)) {
      if (normalizedSubject.includes(key.toLowerCase())) {
        return components;
      }
    }
    return DEFAULT_IGCSE_COMPONENTS.default;
  };

  // Validation: find incomplete assessments
  const incompleteRows = useMemo(() => {
    return students.filter((student) =>
      subjects.some((subject) => {
        const grade = grades[student.id]?.[subject.id];
        return (
          !grade ||
          grade.coursework_score === undefined ||
          grade.exam_score === undefined ||
          grade.coursework_score === null ||
          grade.exam_score === null
        );
      })
    );
  }, [students, subjects, grades]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    const allGrades = students.flatMap((student) =>
      subjects
        .map((subject) => grades[student.id]?.[subject.id])
        .filter(Boolean)
    );

    const gradeCounts = {
      "A*": 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0,
      U: 0,
    };

    allGrades.forEach((grade) => {
      if (grade?.letter_grade) {
        gradeCounts[grade.letter_grade as keyof typeof gradeCounts]++;
      }
    });

    const totalGrades = allGrades.length;
    const averagePercentage =
      allGrades.reduce((sum, g) => sum + (g?.percentage || 0), 0) / totalGrades;
    const passRate =
      (allGrades.filter(
        (g) =>
          g?.letter_grade &&
          ["A*", "A", "B", "C", "D", "E"].includes(g.letter_grade)
      ).length /
        totalGrades) *
      100;

    return {
      gradeCounts,
      totalGrades,
      averagePercentage: Math.round(averagePercentage),
      passRate: Math.round(passRate),
      completionRate:
        totalGrades > 0
          ? Math.round(
              ((totalGrades - incompleteRows.length) / totalGrades) * 100
            )
          : 0,
    };
  }, [students, subjects, grades, incompleteRows]);

  return (
    <div className="space-y-6">
      {/* IGCSE Grading Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-800">
            <Award className="w-6 h-6" />
            IGCSE International Grading Sheet
          </CardTitle>
          <div className="text-sm text-purple-700 space-y-2">
            <p>
              <strong>Curriculum:</strong> International General Certificate of
              Secondary Education (IGCSE)
            </p>
            <p>
              <strong>Assessment Structure:</strong> Coursework (30%) +
              Examination (70%) = Total Score
            </p>
            <p>
              <strong>Grade System:</strong> A* (90%+) | A (80-89%) | B (70-79%)
              | C (60-69%) | D (50-59%) | E (40-49%) | F (30-39%) | G (20-29%) |
              U (0-19%)
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* IGCSE Grade Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grade Boundaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {Object.entries(gradeBoundaries).map(([grade, boundary]) => (
              <div key={grade} className="text-center p-2 rounded-lg border">
                <div
                  className={`text-sm font-bold ${
                    IGCSE_GRADE_COLORS[grade as keyof typeof IGCSE_GRADE_COLORS]
                  }`}
                >
                  {grade}
                </div>
                <div className="text-xs text-gray-600">{boundary}%+</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Class Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-4">
            {Object.entries(classStats.gradeCounts).map(([grade, count]) => (
              <div key={grade} className="text-center p-2 rounded-lg border">
                <div
                  className={`text-lg font-bold ${
                    IGCSE_GRADE_COLORS[grade as keyof typeof IGCSE_GRADE_COLORS]
                  }`}
                >
                  {count}
                </div>
                <div className="text-xs text-gray-600">{grade}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {classStats.averagePercentage}%
              </div>
              <div className="text-sm text-blue-700">Average Score</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {classStats.passRate}%
              </div>
              <div className="text-sm text-green-700">Pass Rate (A*-E)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                {classStats.completionRate}%
              </div>
              <div className="text-sm text-gray-700">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Assessment Warning */}
      {incompleteRows.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            Incomplete Assessments
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            {incompleteRows.length} student(s) have incomplete assessments.
            Please complete all coursework and examination scores.
          </AlertDescription>
        </Alert>
      )}

      {/* Grading Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>IGCSE Assessment Sheet</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComponents(!showComponents)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {showComponents ? "Hide" : "Show"} Components
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10">
                    Student
                  </TableHead>
                  {subjects.map((subject) => (
                    <TableHead
                      key={subject.id}
                      className="text-center min-w-[200px]"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-xs text-gray-500">
                          Coursework (30%) + Exam (70%)
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="sticky left-0 bg-white z-10 font-medium">
                      <div>
                        <div>{student.name}</div>
                        <div className="text-xs text-gray-500">
                          {student.admission_number || student.roll_number}
                        </div>
                      </div>
                    </TableCell>
                    {subjects.map((subject) => {
                      const grade = grades[student.id]?.[subject.id] || {};

                      return (
                        <TableCell key={subject.id} className="text-center">
                          <div className="space-y-2">
                            {/* Coursework Score */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">CW:</span>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={grade.coursework_score || ""}
                                onChange={(e) =>
                                  handleCourseworkScoreChange(
                                    student.id,
                                    subject.id,
                                    e.target.value
                                  )
                                }
                                disabled={viewMode}
                                className="w-16 h-8 text-center text-sm"
                                placeholder="0-100"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>

                            {/* Exam Score */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">EX:</span>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={grade.exam_score || ""}
                                onChange={(e) =>
                                  handleExamScoreChange(
                                    student.id,
                                    subject.id,
                                    e.target.value
                                  )
                                }
                                disabled={viewMode}
                                className="w-16 h-8 text-center text-sm"
                                placeholder="0-100"
                              />
                              <span className="text-xs text-gray-500">%</span>
                            </div>

                            {/* Total Score */}
                            {grade.total_score !== undefined && (
                              <div className="text-sm font-medium">
                                Total: {grade.total_score}%
                              </div>
                            )}

                            {/* Letter Grade */}
                            {grade.letter_grade && (
                              <div className="flex justify-center">
                                {isPrincipal && !viewMode ? (
                                  <Select
                                    value={grade.letter_grade}
                                    onValueChange={(
                                      value:
                                        | "A*"
                                        | "A"
                                        | "B"
                                        | "C"
                                        | "D"
                                        | "E"
                                        | "F"
                                        | "G"
                                        | "U"
                                    ) =>
                                      handleLetterGradeChange(
                                        student.id,
                                        subject.id,
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-16 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.keys(gradeBoundaries).map(
                                        (grade) => (
                                          <SelectItem key={grade} value={grade}>
                                            {grade}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge
                                    className={
                                      IGCSE_GRADE_COLORS[
                                        grade.letter_grade as keyof typeof IGCSE_GRADE_COLORS
                                      ]
                                    }
                                  >
                                    {grade.letter_grade}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Teacher Remarks */}
                            <Textarea
                              value={grade.teacher_remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(
                                  student.id,
                                  subject.id,
                                  e.target.value
                                )
                              }
                              disabled={viewMode}
                              placeholder="Teacher remarks..."
                              className="w-full h-16 text-xs resize-none"
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

      {/* Component Assessment Modal */}
      {showComponents && selectedSubjectForComponents && (
        <Card>
          <CardHeader>
            <CardTitle>
              Component Assessment -{" "}
              {
                subjects.find((s) => s.id === selectedSubjectForComponents)
                  ?.name
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>
                Component assessment functionality will be implemented in the
                next phase.
              </p>
              <p>
                This will include individual paper/component scoring and
                detailed breakdowns.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
