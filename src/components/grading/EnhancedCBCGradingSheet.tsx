import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

interface CBCGradeData {
  student_id?: string;
  subject_id?: string;
  formative_score?: number; // 40% weight
  summative_score?: number; // 60% weight
  total_score?: number; // calculated
  competency_grade?: "EE" | "ME" | "AE" | "BE"; // performance level
  teacher_remarks?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  strand_scores?: Record<string, string>; // strand -> performance level
}

interface EnhancedCBCGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, CBCGradeData>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: CBCGradeData
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
}

// CBC Performance Levels with percentage ranges
const CBC_PERFORMANCE_LEVELS = [
  {
    value: "EE",
    label: "Exceeding Expectation",
    color: "bg-green-100 text-green-800 border-green-200",
    range: "80-100%",
  },
  {
    value: "ME",
    label: "Meeting Expectation",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    range: "50-79%",
  },
  {
    value: "AE",
    label: "Approaching Expectation",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    range: "40-49%",
  },
  {
    value: "BE",
    label: "Below Expectation",
    color: "bg-red-100 text-red-800 border-red-200",
    range: "0-39%",
  },
];

// Default CBC strands for different subjects
const DEFAULT_CBC_STRANDS = {
  Mathematics: [
    "Number and Place Value",
    "Addition and Subtraction",
    "Multiplication and Division",
    "Fractions",
    "Geometry",
    "Measurement",
    "Statistics",
  ],
  English: [
    "Reading",
    "Writing",
    "Speaking and Listening",
    "Grammar and Vocabulary",
    "Comprehension",
    "Creative Writing",
    "Literature",
  ],
  Kiswahili: [
    "Kusoma",
    "Kuandika",
    "Kuzungumza na Kusikiliza",
    "Sarufi na Msamiati",
    "Ufahamu",
    "Uandishi wa Kibunifu",
    "Fasihi",
  ],
  Science: [
    "Scientific Inquiry",
    "Life Processes",
    "Materials and their Properties",
    "Physical Processes",
    "Earth and Space",
    "Working Scientifically",
  ],
  "Social Studies": [
    "Citizenship",
    "History",
    "Geography",
    "Economics",
    "Environmental Awareness",
    "Cultural Understanding",
  ],
  default: [
    "Communication",
    "Problem Solving",
    "Application",
    "Understanding",
    "Creativity",
    "Collaboration",
    "Critical Thinking",
  ],
};

export const EnhancedCBCGradingSheet: React.FC<
  EnhancedCBCGradingSheetProps
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
  const [showStrands, setShowStrands] = useState(false);
  const [selectedSubjectForStrands, setSelectedSubjectForStrands] =
    useState<string>("");

  // Calculate competency grade based on total score
  const calculateCompetencyGrade = (
    totalScore: number
  ): "EE" | "ME" | "AE" | "BE" => {
    if (totalScore >= 80) return "EE";
    if (totalScore >= 50) return "ME";
    if (totalScore >= 40) return "AE";
    return "BE";
  };

  // Calculate total score from formative and summative
  const calculateTotalScore = (
    formative: number,
    summative: number
  ): number => {
    const formativeWeighted = formative * 0.4; // 40% weight
    const summativeWeighted = summative * 0.6; // 60% weight
    return Math.round(formativeWeighted + summativeWeighted);
  };

  // Handle formative score change
  const handleFormativeScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (viewMode) return;

    const formativeScore =
      value === ""
        ? undefined
        : Math.min(100, Math.max(0, parseFloat(value) || 0));
    const currentGrade = grades[studentId]?.[subjectId] || {};
    const summativeScore = (currentGrade as CBCGradeData).summative_score || 0;

    const totalScore =
      formativeScore !== undefined
        ? calculateTotalScore(formativeScore, summativeScore)
        : undefined;
    const competencyGrade =
      totalScore !== undefined
        ? calculateCompetencyGrade(totalScore)
        : undefined;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      formative_score: formativeScore,
      total_score: totalScore,
      competency_grade: competencyGrade,
    });
  };

  // Handle summative score change
  const handleSummativeScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (viewMode) return;

    const summativeScore =
      value === ""
        ? undefined
        : Math.min(100, Math.max(0, parseFloat(value) || 0));
    const currentGrade = grades[studentId]?.[subjectId] || {};
    const formativeScore = (currentGrade as CBCGradeData).formative_score || 0;

    const totalScore =
      summativeScore !== undefined
        ? calculateTotalScore(formativeScore, summativeScore)
        : undefined;
    const competencyGrade =
      totalScore !== undefined
        ? calculateCompetencyGrade(totalScore)
        : undefined;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      summative_score: summativeScore,
      total_score: totalScore,
      competency_grade: competencyGrade,
    });
  };

  // Handle competency grade override (for principals)
  const handleCompetencyGradeChange = (
    studentId: string,
    subjectId: string,
    value: "EE" | "ME" | "AE" | "BE"
  ) => {
    if (viewMode || !isPrincipal) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      competency_grade: value,
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

  // Get subject strands
  const getSubjectStrands = (subjectName: string): string[] => {
    const normalizedSubject = subjectName.toLowerCase();
    for (const [key, strands] of Object.entries(DEFAULT_CBC_STRANDS)) {
      if (normalizedSubject.includes(key.toLowerCase())) {
        return strands;
      }
    }
    return DEFAULT_CBC_STRANDS.default;
  };

  // Validation: find incomplete assessments
  const incompleteRows = useMemo(() => {
    return students.filter((student) =>
      subjects.some((subject) => {
        const grade = grades[student.id]?.[subject.id];
        const cbcGrade = grade as CBCGradeData;
        return (
          !grade ||
          cbcGrade.formative_score === undefined ||
          cbcGrade.summative_score === undefined ||
          cbcGrade.formative_score === null ||
          cbcGrade.summative_score === null
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

    const eeCount = allGrades.filter(
      (g) => (g as CBCGradeData)?.competency_grade === "EE"
    ).length;
    const meCount = allGrades.filter(
      (g) => (g as CBCGradeData)?.competency_grade === "ME"
    ).length;
    const aeCount = allGrades.filter(
      (g) => (g as CBCGradeData)?.competency_grade === "AE"
    ).length;
    const beCount = allGrades.filter(
      (g) => (g as CBCGradeData)?.competency_grade === "BE"
    ).length;
    const totalGrades = allGrades.length;

    const averageTotal =
      allGrades.reduce(
        (sum, g) => sum + ((g as CBCGradeData)?.total_score || 0),
        0
      ) / totalGrades;

    return {
      eeCount,
      meCount,
      aeCount,
      beCount,
      totalGrades,
      averageTotal: Math.round(averageTotal),
      completionRate:
        totalGrades > 0
          ? Math.round(
              ((totalGrades - incompleteRows.length) / totalGrades) * 100
            )
          : 0,
    };
  }, [students, subjects, grades, incompleteRows]);

  // Get performance level info
  const getPerformanceLevelInfo = (level: string) => {
    return (
      CBC_PERFORMANCE_LEVELS.find((l) => l.value === level) ||
      CBC_PERFORMANCE_LEVELS[0]
    );
  };

  return (
    <div className="space-y-6">
      {/* CBC Grading Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-800">
            <Target className="w-6 h-6" />
            CBC Competency-Based Grading Sheet
          </CardTitle>
          <div className="text-sm text-green-700 space-y-2">
            <p>
              <strong>Curriculum:</strong> Competency-Based Curriculum (CBC) -
              Kenyan System
            </p>
            <p>
              <strong>Assessment Structure:</strong> Formative (40%) + Summative
              (60%) = Total Score
            </p>
            <p>
              <strong>Performance Levels:</strong> EE (80-100%) | ME (50-79%) |
              AE (40-49%) | BE (0-39%)
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Level Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Level Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CBC_PERFORMANCE_LEVELS.map((level) => (
              <div
                key={level.value}
                className="flex items-center gap-2 p-3 rounded-lg border"
              >
                <Badge className={level.color}>{level.value}</Badge>
                <div className="text-sm">
                  <div className="font-medium">{level.label}</div>
                  <div className="text-gray-600">{level.range}</div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {classStats.eeCount}
              </div>
              <div className="text-sm text-green-700">Exceeding (EE)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {classStats.meCount}
              </div>
              <div className="text-sm text-blue-700">Meeting (ME)</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {classStats.aeCount}
              </div>
              <div className="text-sm text-yellow-700">Approaching (AE)</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {classStats.beCount}
              </div>
              <div className="text-sm text-red-700">Below (BE)</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                {classStats.averageTotal}%
              </div>
              <div className="text-sm text-gray-700">Average Total Score</div>
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
            Please complete all formative and summative scores.
          </AlertDescription>
        </Alert>
      )}

      {/* Grading Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Competency Assessment Sheet</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStrands(!showStrands)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {showStrands ? "Hide" : "Show"} Strands
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
                          Formative (40%) + Summative (60%)
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
                      const cbcGrade = grade as CBCGradeData;
                      const performanceLevel = getPerformanceLevelInfo(
                        cbcGrade.competency_grade || ""
                      );

                      return (
                        <TableCell key={subject.id} className="text-center">
                          <div className="space-y-2">
                            {/* Formative Score */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">F:</span>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={cbcGrade.formative_score || ""}
                                onChange={(e) =>
                                  handleFormativeScoreChange(
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

                            {/* Summative Score */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">S:</span>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={cbcGrade.summative_score || ""}
                                onChange={(e) =>
                                  handleSummativeScoreChange(
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
                            {cbcGrade.total_score !== undefined && (
                              <div className="text-sm font-medium">
                                Total: {cbcGrade.total_score}%
                              </div>
                            )}

                            {/* Competency Grade */}
                            {cbcGrade.competency_grade && (
                              <div className="flex justify-center">
                                {isPrincipal && !viewMode ? (
                                  <Select
                                    value={cbcGrade.competency_grade}
                                    onValueChange={(
                                      value: "EE" | "ME" | "AE" | "BE"
                                    ) =>
                                      handleCompetencyGradeChange(
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
                                      {CBC_PERFORMANCE_LEVELS.map((level) => (
                                        <SelectItem
                                          key={level.value}
                                          value={level.value}
                                        >
                                          {level.value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge className={performanceLevel.color}>
                                    {grade.competency_grade}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Teacher Remarks */}
                            <Textarea
                              value={cbcGrade.teacher_remarks || ""}
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

      {/* Strand Assessment Modal */}
      {showStrands && selectedSubjectForStrands && (
        <Card>
          <CardHeader>
            <CardTitle>
              Strand Assessment -{" "}
              {subjects.find((s) => s.id === selectedSubjectForStrands)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>
                Strand assessment functionality will be implemented in the next
                phase.
              </p>
              <p>
                This will include individual strand scoring and competency
                tracking.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
