import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Edit } from "lucide-react";

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
  percentage?: number | null;
  isAbsent?: boolean;
  comments?: string;
  overridden_score?: number | null;
}

interface StudentTotal {
  studentId: string;
  totalScore: number;
  totalPossible: number;
  percentage: number;
  averageScore: number;
  subjectCount: number;
  position: number;
  letterGrade: string;
}

interface EnhancedGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeValue>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: GradeValue
  ) => void;
  curriculumType: string;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
  cellRefs?: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement>>;
  onKeyDown?: (e: React.KeyboardEvent, studentId: string, subjectId: string) => void;
  editingCell?: { studentId: string; subjectId: string } | null;
  setEditingCell?: React.Dispatch<React.SetStateAction<{ studentId: string; subjectId: string } | null>>;
}

export const EnhancedGradingSheet: React.FC<EnhancedGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  curriculumType,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType,
  isPrincipal = false,
  isViewOnly = false,
}) => {
  const getLetterGrade = (score: number): string => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C+";
    if (score >= 40) return "C";
    if (score >= 30) return "D+";
    if (score >= 20) return "D";
    return "E";
  };

  // Calculate student totals and positions
  const studentTotals = useMemo((): StudentTotal[] => {
    const totals = students.map((student) => {
      const studentGrades = grades[student.id] || {};
      let totalScore = 0;
      let totalPossible = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const grade = studentGrades[subject.id];
        if (grade?.score && grade.score > 0 && !grade.isAbsent) {
          totalScore += grade.score;
          totalPossible += 100; // Assuming max score of 100 per subject
          subjectCount++;
        }
      });

      const percentage =
        totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;
      const letterGrade = averageScore > 0 ? getLetterGrade(averageScore) : "";

      return {
        studentId: student.id,
        totalScore,
        totalPossible,
        percentage,
        averageScore,
        subjectCount,
        position: 0, // Will be set below
        letterGrade,
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
    });

    return totals;
  }, [students, subjects, grades]);

  const [viewMode, setViewMode] = React.useState(isReadOnly || isViewOnly);

  // Validation: find incomplete rows
  const incompleteRows = students.filter((student) =>
    subjects.some((subject) => {
      const grade = grades[student.id]?.[subject.id];
      return (
        !grade ||
        grade.score === undefined ||
        grade.score === null ||
        (grade.score === 0 && !grade.isAbsent)
      );
    })
  );

  const handleScoreChange = (
    studentId: string,
    subjectId: string,
    value: string
  ) => {
    if (isReadOnly) return;

    const score = value === "" ? null : parseFloat(value);
    const percentage = score !== null ? score : null;
    const letter_grade = score !== null ? getLetterGrade(score) : null;

    onGradeChange(studentId, subjectId, {
      score,
      percentage,
      letter_grade,
      isAbsent: false,
    });
  };

  const handleAbsentChange = (
    studentId: string,
    subjectId: string,
    isAbsent: boolean
  ) => {
    if (isReadOnly) return;

    onGradeChange(studentId, subjectId, {
      score: isAbsent ? null : undefined,
      percentage: null,
      letter_grade: null,
      isAbsent,
      comments: isAbsent ? "Student was absent" : "",
    });
  };

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between bg-gray-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <span>
            Class: <strong>{selectedClass}</strong>
          </span>
          <span>•</span>
          <span>
            Term: <strong>{selectedTerm}</strong>
          </span>
          <span>•</span>
          <span>
            Exam: <strong>{selectedExamType}</strong>
          </span>
          <span>•</span>
          <span>
            Curriculum: <strong>{curriculumType.toUpperCase()}</strong>
          </span>
          {viewMode && (
            <Badge variant="secondary" className="ml-2">
              Read Only
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="view-mode-toggle"
            className="text-xs font-medium text-gray-700"
          >
            View Mode
          </label>
          <input
            id="view-mode-toggle"
            type="checkbox"
            checked={viewMode}
            onChange={() => setViewMode((v) => !v)}
            disabled={isReadOnly || isViewOnly}
            aria-label="Toggle view mode"
            className="accent-blue-600 h-4 w-4"
          />
        </div>
      </div>
      {/* Scrollable Table Container */}
      <div className="min-w-fit">
        <table className="w-full border-collapse" aria-label="Grading Sheet">
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => (
                <th
                  key={subject.id}
                  className="border border-gray-300 p-3 text-center font-semibold min-w-[180px]"
                >
                  <div className="font-medium text-sm">{subject.name}</div>
                  {subject.code && (
                    <div className="text-xs text-gray-600 mt-1">
                      {subject.code}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Out of 100</div>
                </th>
              ))}
              <th className="border border-gray-300 p-3 text-center font-semibold min-w-[220px] bg-blue-50">
                <div className="font-medium text-blue-800">Student Summary</div>
                <div className="text-xs text-blue-600 mt-1">
                  Total | Average | Position | Grade
                </div>
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {students.map((student, studentIndex) => {
              const studentTotal = studentTotals.find(
                (t) => t.studentId === student.id
              );
              const isIncomplete = incompleteRows.some(
                (s) => s.id === student.id
              );
              return (
                <tr
                  key={student.id}
                  className={`${
                    studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                  } hover:bg-blue-25 transition-colors ${
                    isIncomplete ? "bg-yellow-50" : ""
                  }`}
                >
                  {" "}
                  {/* highlight incomplete */}
                  {/* Student Info Cell */}
                  <td
                    className={`border border-gray-300 p-3 sticky left-0 z-10 ${
                      studentIndex % 2 === 0 ? "bg-gray-25" : "bg-white"
                    }`}
                  >
                    {" "}
                    {/* sticky first col */}
                    <div className="font-medium text-sm mb-1">
                      {student.name}
                    </div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      {student.admission_number && (
                        <span>Adm# {student.admission_number}</span>
                      )}
                      {student.roll_number && (
                        <span>Roll# {student.roll_number}</span>
                      )}
                    </div>
                    {isIncomplete && (
                      <div className="text-xs text-yellow-700 flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> Incomplete
                      </div>
                    )}
                  </td>
                  {/* Grade Cells */}
                  {subjects.map((subject) => {
                    const gradeValue = grades[student.id]?.[subject.id];
                    const isOverridden =
                      isPrincipal &&
                      gradeValue?.overridden_score !== undefined &&
                      gradeValue?.overridden_score !== null;
                    return (
                      <td
                        key={`${student.id}-${subject.id}`}
                        className={`border border-gray-300 p-2 ${
                          isOverridden ? "border-blue-500 bg-blue-50" : ""
                        }`}
                      >
                        {" "}
                        {/* highlight overridden */}
                        <div className="space-y-2">
                          {/* Score Input */}
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder={
                              gradeValue?.isAbsent ? "Absent" : "0-100"
                            }
                            value={
                              gradeValue?.isAbsent
                                ? ""
                                : isOverridden
                                ? gradeValue?.overridden_score
                                : gradeValue?.score || ""
                            }
                            onChange={(e) => {
                              if (viewMode) return;
                              const val = e.target.value;
                              if (isPrincipal) {
                                onGradeChange(student.id, subject.id, {
                                  ...gradeValue,
                                  overridden_score:
                                    val === "" ? null : parseFloat(val),
                                });
                              } else {
                                onGradeChange(student.id, subject.id, {
                                  ...gradeValue,
                                  score: val === "" ? null : parseFloat(val),
                                });
                              }
                            }}
                            disabled={viewMode || gradeValue?.isAbsent}
                            aria-label={`Grade for ${student.name} in ${subject.name}`}
                            className={`h-8 text-center text-sm font-medium transition-colors ${
                              gradeValue?.isAbsent
                                ? "bg-red-50 text-red-600"
                                : gradeValue?.score
                                ? "bg-green-50 border-green-200"
                                : ""
                            }`}
                          />
                          {/* Overridden Indicator */}
                          {isOverridden && (
                            <div className="flex items-center gap-1 text-blue-700 text-xs">
                              <Edit className="h-3 w-3" /> Overridden
                            </div>
                          )}
                          {/* Grade Display */}
                          {(isOverridden
                            ? gradeValue?.overridden_score
                            : gradeValue?.score) !== null &&
                            (isOverridden
                              ? gradeValue?.overridden_score
                              : gradeValue?.score) !== undefined &&
                            !gradeValue?.isAbsent && (
                              <div className="flex items-center justify-center">
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0 ${
                                    gradeValue.letter_grade === "A+" ||
                                    gradeValue.letter_grade === "A"
                                      ? "border-green-500 text-green-700"
                                      : gradeValue.letter_grade === "B+" ||
                                        gradeValue.letter_grade === "B"
                                      ? "border-blue-500 text-blue-700"
                                      : gradeValue.letter_grade === "C+" ||
                                        gradeValue.letter_grade === "C"
                                      ? "border-yellow-500 text-yellow-700"
                                      : gradeValue.letter_grade === "D+" ||
                                        gradeValue.letter_grade === "D"
                                      ? "border-orange-500 text-orange-700"
                                      : "border-red-500 text-red-700"
                                  }`}
                                >
                                  {gradeValue.letter_grade}
                                </Badge>
                              </div>
                            )}
                          {gradeValue?.isAbsent && (
                            <div className="text-center">
                              <Badge variant="destructive" className="text-xs">
                                ABS
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {/* Summary Cell */}
                  <td className="border border-gray-300 p-3 bg-blue-25 text-center min-w-[220px]">
                    {studentTotal && studentTotal.subjectCount > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-blue-800">
                          Total: {studentTotal.totalScore.toFixed(0)}/
                          {studentTotal.totalPossible}
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          Average: {studentTotal.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          Overall: {studentTotal.percentage.toFixed(1)}%
                        </div>
                        <div className="flex justify-center">
                          <Badge
                            variant="default"
                            className="text-xs bg-blue-600 text-white px-2 py-1"
                          >
                            Position:{" "}
                            {studentTotal.position > 0
                              ? studentTotal.position
                              : "N/A"}
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-1 ${
                              studentTotal.letterGrade === "A+" ||
                              studentTotal.letterGrade === "A"
                                ? "border-green-500 text-green-700 bg-green-50"
                                : studentTotal.letterGrade === "B+" ||
                                  studentTotal.letterGrade === "B"
                                ? "border-blue-500 text-blue-700 bg-blue-50"
                                : studentTotal.letterGrade === "C+" ||
                                  studentTotal.letterGrade === "C"
                                ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                : studentTotal.letterGrade === "D+" ||
                                  studentTotal.letterGrade === "D"
                                ? "border-orange-500 text-orange-700 bg-orange-50"
                                : "border-red-500 text-red-700 bg-red-50"
                            }`}
                          >
                            Grade: {studentTotal.letterGrade}
                          </Badge>
                        </div>
                        <div className="text-xs text-blue-600">
                          {studentTotal.subjectCount} subjects
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        No grades entered
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
