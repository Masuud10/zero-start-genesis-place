import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
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
  Trophy,
  Users,
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

interface StandardGradeData {
  student_id?: string;
  subject_id?: string;
  score?: number; // 0-100 scale
  letter_grade?: string; // A+, A, A-, B+, etc.
  percentage?: number; // calculated percentage
  position?: number; // class position
  stream_position?: number; // stream position (if applicable)
  teacher_remarks?: string;
  conduct?: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";
  status?: "draft" | "submitted" | "approved" | "rejected";
  is_absent?: boolean;
}

interface StudentTotal {
  studentId: string;
  totalScore: number;
  totalPossible: number;
  percentage: number;
  averageScore: number;
  subjectCount: number;
  position: number;
  streamPosition: number;
  letterGrade: string;
  overallConduct: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";
}

interface EnhancedStandardGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, StandardGradeData>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: StandardGradeData
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
}

// Standard Letter Grades with percentage ranges
const STANDARD_LETTER_GRADES = [
  {
    value: "A+",
    label: "A+ (Distinction)",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    range: "90-100%",
  },
  {
    value: "A",
    label: "A (Excellent)",
    color: "bg-green-100 text-green-800 border-green-200",
    range: "80-89%",
  },
  {
    value: "A-",
    label: "A- (Very Good)",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    range: "75-79%",
  },
  {
    value: "B+",
    label: "B+ (Good)",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    range: "70-74%",
  },
  {
    value: "B",
    label: "B (Above Average)",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    range: "65-69%",
  },
  {
    value: "B-",
    label: "B- (Average)",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    range: "60-64%",
  },
  {
    value: "C+",
    label: "C+ (Below Average)",
    color: "bg-red-100 text-red-800 border-red-200",
    range: "55-59%",
  },
  {
    value: "C",
    label: "C (Pass)",
    color: "bg-red-100 text-red-800 border-red-200",
    range: "50-54%",
  },
  {
    value: "C-",
    label: "C- (Weak Pass)",
    color: "bg-red-100 text-red-800 border-red-200",
    range: "45-49%",
  },
  {
    value: "D+",
    label: "D+ (Poor)",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    range: "40-44%",
  },
  {
    value: "D",
    label: "D (Very Poor)",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    range: "35-39%",
  },
  {
    value: "D-",
    label: "D- (Fail)",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    range: "30-34%",
  },
  {
    value: "E",
    label: "E (Fail)",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    range: "0-29%",
  },
];

// Conduct Options
const CONDUCT_OPTIONS = [
  {
    value: "Excellent",
    label: "Excellent",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "Very Good",
    label: "Very Good",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "Good", label: "Good", color: "bg-yellow-100 text-yellow-800" },
  { value: "Fair", label: "Fair", color: "bg-orange-100 text-orange-800" },
  { value: "Poor", label: "Poor", color: "bg-red-100 text-red-800" },
];

export const EnhancedStandardGradingSheet: React.FC<
  EnhancedStandardGradingSheetProps
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
  const [showRankings, setShowRankings] = useState(true);
  const [enableStreamPosition, setEnableStreamPosition] = useState(false);

  // Calculate letter grade based on score
  const calculateLetterGrade = (score: number): string => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 75) return "A-";
    if (score >= 70) return "B+";
    if (score >= 65) return "B";
    if (score >= 60) return "B-";
    if (score >= 55) return "C+";
    if (score >= 50) return "C";
    if (score >= 45) return "C-";
    if (score >= 40) return "D+";
    if (score >= 35) return "D";
    if (score >= 30) return "D-";
    return "E";
  };

  // Calculate student totals and positions
  const studentTotals = useMemo((): StudentTotal[] => {
    const totals = students.map((student) => {
      const studentGrades = grades[student.id] || {};
      let totalScore = 0;
      let totalPossible = 0;
      let subjectCount = 0;
      let conductScores = 0;
      let conductCount = 0;

      subjects.forEach((subject) => {
        const grade = studentGrades[subject.id];
        if (grade && !grade.is_absent) {
          if (grade.score !== undefined && grade.score !== null) {
            totalScore += grade.score;
            totalPossible += 100;
            subjectCount++;
          }
          if (grade.conduct) {
            const conductValue =
              CONDUCT_OPTIONS.findIndex((c) => c.value === grade.conduct) + 1;
            conductScores += conductValue;
            conductCount++;
          }
        }
      });

      const percentage =
        totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;
      const letterGrade =
        averageScore > 0 ? calculateLetterGrade(averageScore) : "";
      const averageConduct =
        conductCount > 0 ? conductScores / conductCount : 0;

      let overallConduct: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor" =
        "Good";
      if (averageConduct >= 4.5) overallConduct = "Excellent";
      else if (averageConduct >= 3.5) overallConduct = "Very Good";
      else if (averageConduct >= 2.5) overallConduct = "Good";
      else if (averageConduct >= 1.5) overallConduct = "Fair";
      else overallConduct = "Poor";

      return {
        studentId: student.id,
        totalScore,
        totalPossible,
        percentage,
        averageScore,
        subjectCount,
        position: 0, // Will be set below
        streamPosition: 0, // Will be set below
        letterGrade,
        overallConduct,
      };
    });

    // Sort by total score for position calculation
    const sortedTotals = [...totals].sort(
      (a, b) => b.totalScore - a.totalScore
    );

    // Assign positions (handle ties)
    let currentPosition = 1;
    sortedTotals.forEach((total, index) => {
      if (index > 0 && sortedTotals[index - 1].totalScore > total.totalScore) {
        currentPosition = index + 1;
      }
      total.position = total.totalScore > 0 ? currentPosition : 0;
      total.streamPosition = total.totalScore > 0 ? currentPosition : 0; // Same as class position for now
    });

    return totals;
  }, [students, subjects, grades]);

  // Handle score change
  const handleScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (viewMode) return;

    const score =
      value === ""
        ? undefined
        : Math.min(100, Math.max(0, parseFloat(value) || 0));
    const percentage = score;
    const letter_grade =
      score !== undefined ? calculateLetterGrade(score) : undefined;

    onGradeChange(studentId, subjectId, {
      score,
      percentage,
      letter_grade,
      is_absent: false,
    });
  };

  // Handle absent change
  const handleAbsentChange = (
    studentId: string,
    subjectId: string,
    isAbsent: boolean
  ) => {
    if (viewMode) return;

    onGradeChange(studentId, subjectId, {
      score: isAbsent ? null : undefined,
      percentage: null,
      letter_grade: null,
      is_absent: isAbsent,
      teacher_remarks: isAbsent ? "Student was absent" : "",
    });
  };

  // Handle conduct change
  const handleConductChange = (
    studentId: string,
    subjectId: string,
    conduct: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor"
  ) => {
    if (viewMode) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      conduct,
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

  // Validation: find incomplete assessments
  const incompleteRows = useMemo(() => {
    return students.filter((student) =>
      subjects.some((subject) => {
        const grade = grades[student.id]?.[subject.id];
        return (
          !grade ||
          (grade.score === undefined && !grade.is_absent) ||
          (grade.score === null && !grade.is_absent)
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

    const gradeCounts: Record<string, number> = {};
    STANDARD_LETTER_GRADES.forEach((grade) => {
      gradeCounts[grade.value] = 0;
    });

    allGrades.forEach((grade) => {
      if (grade?.letter_grade && !grade.is_absent) {
        gradeCounts[grade.letter_grade]++;
      }
    });

    const totalGrades = allGrades.filter((g) => !g?.is_absent).length;
    const averageScore =
      allGrades.reduce((sum, g) => sum + (g?.score || 0), 0) / totalGrades;
    const passRate =
      (allGrades.filter(
        (g) =>
          g?.letter_grade &&
          [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D+",
            "D",
            "D-",
          ].includes(g.letter_grade)
      ).length /
        totalGrades) *
      100;

    return {
      gradeCounts,
      totalGrades,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      completionRate:
        totalGrades > 0
          ? Math.round(
              ((totalGrades - incompleteRows.length) / totalGrades) * 100
            )
          : 0,
    };
  }, [students, subjects, grades, incompleteRows]);

  // Get letter grade info
  const getLetterGradeInfo = (grade: string) => {
    return (
      STANDARD_LETTER_GRADES.find((g) => g.value === grade) ||
      STANDARD_LETTER_GRADES[0]
    );
  };

  // Get conduct info
  const getConductInfo = (conduct: string) => {
    return (
      CONDUCT_OPTIONS.find((c) => c.value === conduct) || CONDUCT_OPTIONS[2]
    );
  };

  return (
    <div className="space-y-6">
      {/* Standard Grading Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <Award className="w-6 h-6" />
            Standard 8-4-4 Grading Sheet
          </CardTitle>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>Curriculum:</strong> Standard Curriculum (8-4-4 System) -
              Kenyan Traditional
            </p>
            <p>
              <strong>Assessment Structure:</strong> 100% Scale with Letter
              Grades and Position Ranking
            </p>
            <p>
              <strong>Grade System:</strong> A+ (90-100%) | A (80-89%) | A-
              (75-79%) | B+ (70-74%) | B (65-69%) | B- (60-64%) | C+ (55-59%) |
              C (50-54%) | C- (45-49%) | D+ (40-44%) | D (35-39%) | D- (30-34%)
              | E (0-29%)
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Letter Grade Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Letter Grade Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {STANDARD_LETTER_GRADES.map((grade) => (
              <div
                key={grade.value}
                className="flex items-center gap-2 p-2 rounded-lg border"
              >
                <Badge className={grade.color}>{grade.value}</Badge>
                <div className="text-xs">
                  <div className="font-medium">{grade.label}</div>
                  <div className="text-gray-600">{grade.range}</div>
                </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {STANDARD_LETTER_GRADES.map((grade) => (
              <div
                key={grade.value}
                className="text-center p-2 rounded-lg border"
              >
                <div className={`text-lg font-bold ${grade.color}`}>
                  {classStats.gradeCounts[grade.value] || 0}
                </div>
                <div className="text-xs text-gray-600">{grade.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {classStats.averageScore}%
              </div>
              <div className="text-sm text-blue-700">Average Score</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {classStats.passRate}%
              </div>
              <div className="text-sm text-green-700">Pass Rate (A+-D-)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                {classStats.completionRate}%
              </div>
              <div className="text-sm text-gray-700">Completion Rate</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {students.length}
              </div>
              <div className="text-sm text-purple-700">Total Students</div>
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
            Please complete all scores or mark as absent.
          </AlertDescription>
        </Alert>
      )}

      {/* Grading Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Standard Assessment Sheet</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRankings(!showRankings)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                {showRankings ? "Hide" : "Show"} Rankings
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
                  {showRankings && (
                    <>
                      <TableHead className="text-center">Position</TableHead>
                      {enableStreamPosition && (
                        <TableHead className="text-center">
                          Stream Pos
                        </TableHead>
                      )}
                    </>
                  )}
                  {subjects.map((subject) => (
                    <TableHead
                      key={subject.id}
                      className="text-center min-w-[180px]"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-xs text-gray-500">
                          Score (0-100)
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[120px]">
                    Overall
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const studentTotal = studentTotals.find(
                    (t) => t.studentId === student.id
                  );

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-white z-10 font-medium">
                        <div>
                          <div>{student.name}</div>
                          <div className="text-xs text-gray-500">
                            {student.admission_number || student.roll_number}
                          </div>
                        </div>
                      </TableCell>
                      {showRankings && (
                        <>
                          <TableCell className="text-center">
                            {studentTotal?.position || "-"}
                          </TableCell>
                          {enableStreamPosition && (
                            <TableCell className="text-center">
                              {studentTotal?.streamPosition || "-"}
                            </TableCell>
                          )}
                        </>
                      )}
                      {subjects.map((subject) => {
                        const grade = grades[student.id]?.[subject.id] || {};
                        const letterGradeInfo = getLetterGradeInfo(
                          grade.letter_grade || ""
                        );

                        return (
                          <TableCell key={subject.id} className="text-center">
                            <div className="space-y-2">
                              {/* Score Input */}
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={grade.score || ""}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      student.id,
                                      subject.id,
                                      e.target.value
                                    )
                                  }
                                  disabled={viewMode || grade.is_absent}
                                  className="w-16 h-8 text-center text-sm"
                                  placeholder="0-100"
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>

                              {/* Absent Checkbox */}
                              <div className="flex items-center gap-1">
                                <Checkbox
                                  checked={grade.is_absent || false}
                                  onCheckedChange={(checked) =>
                                    handleAbsentChange(
                                      student.id,
                                      subject.id,
                                      checked as boolean
                                    )
                                  }
                                  disabled={viewMode}
                                />
                                <span className="text-xs text-gray-500">
                                  Absent
                                </span>
                              </div>

                              {/* Letter Grade */}
                              {grade.letter_grade && !grade.is_absent && (
                                <div className="flex justify-center">
                                  <Badge className={letterGradeInfo.color}>
                                    {grade.letter_grade}
                                  </Badge>
                                </div>
                              )}

                              {/* Conduct */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">
                                  Conduct:
                                </span>
                                <Select
                                  value={grade.conduct || "Good"}
                                  onValueChange={(
                                    value:
                                      | "Excellent"
                                      | "Very Good"
                                      | "Good"
                                      | "Fair"
                                      | "Poor"
                                  ) =>
                                    handleConductChange(
                                      student.id,
                                      subject.id,
                                      value
                                    )
                                  }
                                  disabled={viewMode}
                                >
                                  <SelectTrigger className="w-20 h-6 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONDUCT_OPTIONS.map((conduct) => (
                                      <SelectItem
                                        key={conduct.value}
                                        value={conduct.value}
                                      >
                                        {conduct.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

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
                                placeholder="Remarks..."
                                className="w-full h-12 text-xs resize-none"
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {studentTotal?.letterGrade || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Pos: {studentTotal?.position || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {studentTotal?.overallConduct || "Good"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
