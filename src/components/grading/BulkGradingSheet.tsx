
import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  isAbsent?: boolean;
};

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

interface BulkGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeValue>>;
  onGradeChange: (studentId: string, subjectId: string, value: GradeValue) => void;
  curriculumType: string;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
}

const BulkGradingSheet: React.FC<BulkGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  curriculumType,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType
}) => {
  const getLetterGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Calculate student totals and positions
  const studentTotals = useMemo((): StudentTotal[] => {
    const totals = students.map(student => {
      const studentGrades = grades[student.id] || {};
      let totalScore = 0;
      let totalPossible = 0;
      let subjectCount = 0;

      subjects.forEach(subject => {
        const grade = studentGrades[subject.id];
        if (grade?.score && grade.score > 0 && !grade.isAbsent) {
          totalScore += grade.score;
          totalPossible += 100; // Assuming max score of 100 per subject
          subjectCount++;
        }
      });

      const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;
      const letterGrade = averageScore > 0 ? getLetterGrade(averageScore) : '';

      return {
        studentId: student.id,
        totalScore,
        totalPossible,
        percentage,
        averageScore,
        subjectCount,
        position: 0, // Will be set below
        letterGrade
      };
    });

    // Sort by total score for position calculation
    const sortedTotals = [...totals].sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign positions
    sortedTotals.forEach((total, index) => {
      total.position = index + 1;
    });

    return totals;
  }, [students, subjects, grades]);

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    if (isReadOnly) return;
    
    const score = value === '' ? null : parseFloat(value);
    const percentage = score !== null ? score : null;
    const letter_grade = score !== null ? getLetterGrade(score) : null;
    
    onGradeChange(studentId, subjectId, {
      score,
      percentage,
      letter_grade,
      isAbsent: false
    });
  };

  const handleAbsentChange = (studentId: string, subjectId: string, isAbsent: boolean) => {
    if (isReadOnly) return;
    
    onGradeChange(studentId, subjectId, {
      score: isAbsent ? null : 0,
      percentage: null,
      letter_grade: null,
      isAbsent
    });
  };

  return (
    <div className="w-full h-full overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-gray-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <span>Class: <strong>{selectedClass}</strong></span>
          <span>•</span>
          <span>Term: <strong>{selectedTerm}</strong></span>
          <span>•</span>
          <span>Exam: <strong>{selectedExamType}</strong></span>
          {isReadOnly && (
            <Badge variant="secondary" className="ml-2">Read Only</Badge>
          )}
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="min-w-fit">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[250px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => (
                <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[150px]">
                  <div className="font-medium text-sm">{subject.name}</div>
                  {subject.code && (
                    <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Out of 100</div>
                </th>
              ))}
              <th className="border border-gray-300 p-3 text-center font-semibold min-w-[180px] bg-blue-50">
                <div className="font-medium text-blue-800">Summary</div>
                <div className="text-xs text-blue-600 mt-1">Total | Average | Position</div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {students.map((student, studentIndex) => {
              const studentTotal = studentTotals.find(t => t.studentId === student.id);
              
              return (
                <tr key={student.id} className={`${studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'} hover:bg-blue-25`}>
                  {/* Student Info Cell */}
                  <td className={`border border-gray-300 p-3 sticky left-0 z-10 ${
                    studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                  }`}>
                    <div className="font-medium text-sm mb-1">{student.name}</div>
                    <div className="flex gap-2 text-xs text-gray-600">
                      {student.admission_number && (
                        <span>Adm: {student.admission_number}</span>
                      )}
                      {student.roll_number && (
                        <span>Roll: {student.roll_number}</span>
                      )}
                    </div>
                  </td>

                  {/* Grade Cells */}
                  {subjects.map((subject) => {
                    const gradeValue = grades[student.id]?.[subject.id];
                    
                    return (
                      <td key={`${student.id}-${subject.id}`} className="border border-gray-300 p-2">
                        <div className="space-y-2">
                          {/* Absent Checkbox */}
                          <div className="flex items-center gap-1">
                            <Checkbox
                              id={`absent-${student.id}-${subject.id}`}
                              checked={gradeValue?.isAbsent || false}
                              onCheckedChange={(checked) => 
                                handleAbsentChange(student.id, subject.id, !!checked)
                              }
                              disabled={isReadOnly}
                              className="h-3 w-3"
                            />
                            <label 
                              htmlFor={`absent-${student.id}-${subject.id}`}
                              className="text-xs text-gray-600 cursor-pointer"
                            >
                              Absent
                            </label>
                          </div>
                          
                          {/* Score Input */}
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder={gradeValue?.isAbsent ? "Absent" : "0-100"}
                            value={gradeValue?.isAbsent ? '' : (gradeValue?.score || '')}
                            onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                            disabled={isReadOnly || gradeValue?.isAbsent}
                            className={`h-8 text-center text-sm font-medium ${
                              gradeValue?.isAbsent ? 'bg-red-50 text-red-600' : ''
                            }`}
                          />
                          
                          {/* Grade Display */}
                          {gradeValue?.score !== null && gradeValue?.score !== undefined && !gradeValue?.isAbsent && (
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="text-xs px-1 py-0">
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
                  <td className="border border-gray-300 p-3 bg-blue-25 text-center">
                    {studentTotal && studentTotal.subjectCount > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-blue-800">
                          Total: {studentTotal.totalScore.toFixed(0)}/{studentTotal.totalPossible}
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          Avg: {studentTotal.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          {studentTotal.percentage.toFixed(1)}%
                        </div>
                        <Badge variant="default" className="text-xs bg-blue-600 text-white">
                          Pos: {studentTotal.position}
                        </Badge>
                        <div className="text-xs text-blue-600 mt-1">
                          Grade: {studentTotal.letterGrade}
                        </div>
                        <div className="text-xs text-blue-600">
                          {studentTotal.subjectCount} subjects
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No grades yet</div>
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

export default BulkGradingSheet;
