
import React, { useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  admission_number: string;
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
}

interface BulkGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeValue>>;
  onGradeChange: (studentId: string, subjectId: string, grade: GradeValue) => void;
  curriculumType: 'cbc' | 'igcse' | 'standard';
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
  // Calculate student totals and positions
  const studentStats = useMemo(() => {
    const stats = students.map(student => {
      let totalScore = 0;
      let totalPossible = 0;
      let subjectCount = 0;

      subjects.forEach(subject => {
        const grade = grades[student.id]?.[subject.id];
        if (grade?.score && grade.score > 0) {
          totalScore += Number(grade.score);
          totalPossible += 100; // Assuming max 100 per subject
          subjectCount++;
        }
      });

      const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      const average = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;

      return {
        studentId: student.id,
        totalScore,
        totalPossible,
        percentage,
        average,
        subjectCount
      };
    });

    // Calculate positions based on percentage
    const sortedStats = [...stats].sort((a, b) => b.percentage - a.percentage);
    const statsWithPosition = stats.map(stat => {
      const position = sortedStats.findIndex(s => s.studentId === stat.studentId) + 1;
      return { ...stat, position: stat.percentage > 0 ? position : null };
    });

    return Object.fromEntries(statsWithPosition.map(stat => [stat.studentId, stat]));
  }, [students, subjects, grades]);

  // Auto-calculate positions when grades change
  useEffect(() => {
    const calculatePositions = async () => {
      if (selectedClass && selectedTerm && selectedExamType) {
        try {
          await supabase.rpc('calculate_class_positions', {
            p_class_id: selectedClass,
            p_term: selectedTerm,
            p_exam_type: selectedExamType
          });
        } catch (error) {
          console.error('Error calculating positions:', error);
        }
      }
    };

    // Debounce position calculation
    const timeoutId = setTimeout(calculatePositions, 2000);
    return () => clearTimeout(timeoutId);
  }, [grades, selectedClass, selectedTerm, selectedExamType]);

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D+';
    if (percentage >= 20) return 'D';
    return 'E';
  };

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    if (isReadOnly) return;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      if (value === '') {
        onGradeChange(studentId, subjectId, {
          score: null,
          percentage: null,
          letter_grade: null
        });
      }
      return;
    }

    const percentage = Math.round(numericValue);
    const letterGrade = getLetterGrade(percentage);

    onGradeChange(studentId, subjectId, {
      score: numericValue,
      percentage,
      letter_grade: letterGrade
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    if (isReadOnly) return;

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      // Move to next cell
      let nextRow = rowIndex;
      let nextCol = colIndex + 1;
      
      if (nextCol >= subjects.length) {
        nextCol = 0;
        nextRow = rowIndex + 1;
      }
      
      if (nextRow < students.length) {
        const nextInput = document.querySelector(
          `input[data-row="${nextRow}"][data-col="${nextCol}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  if (students.length === 0 || subjects.length === 0) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <div className="text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-sm">
              {students.length === 0 && subjects.length === 0
                ? "Please ensure the class has students enrolled and subjects assigned."
                : students.length === 0
                ? "No students found for this class."
                : "No subjects found for this class."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
              {students.length}
            </Badge>
            <span className="font-medium">Students</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
              {subjects.length}
            </Badge>
            <span className="font-medium">Subjects</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
              {students.length * subjects.length}
            </Badge>
            <span className="font-medium">Total Grades</span>
          </div>
        </Card>
      </div>

      {/* Grading Table */}
      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background z-20 border-r-2 border-border">
                <div className="space-y-1">
                  <div className="font-semibold">Student Details</div>
                  <div className="text-xs text-muted-foreground">Name | Admission No.</div>
                </div>
              </TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject.id} className="min-w-[120px] text-center bg-blue-50">
                  <div className="space-y-1">
                    <div className="font-semibold text-blue-800">{subject.name}</div>
                    <div className="text-xs text-blue-600">{subject.code}</div>
                    <div className="text-xs text-blue-700 font-medium">/ 100</div>
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[150px] text-center bg-gradient-to-r from-green-50 to-blue-50 sticky right-0 z-20 border-l-2 border-border">
                <div className="space-y-1">
                  <div className="font-semibold flex items-center justify-center gap-1 text-green-800">
                    <Award className="h-4 w-4" />
                    Summary
                  </div>
                  <div className="text-xs text-green-600">Total | % | Position</div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, rowIndex) => {
              const stats = studentStats[student.id];
              
              return (
                <TableRow key={student.id} className={rowIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                  {/* Student Info */}
                  <TableCell className="sticky left-0 bg-inherit z-10 border-r-2 border-border">
                    <div className="min-w-[180px] space-y-1">
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.admission_number}
                        {student.roll_number && ` | Roll: ${student.roll_number}`}
                      </div>
                    </div>
                  </TableCell>

                  {/* Subject Grades */}
                  {subjects.map((subject, colIndex) => {
                    const currentGrade = grades[student.id]?.[subject.id] || {};
                    
                    return (
                      <TableCell key={subject.id} className="p-2 bg-blue-50/30">
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={currentGrade.score?.toString() || ''}
                            onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            placeholder="0-100"
                            className={`h-10 text-center text-sm font-medium ${
                              isReadOnly 
                                ? 'bg-gray-100 cursor-not-allowed' 
                                : 'bg-white hover:bg-blue-50 focus:bg-white border-blue-200 focus:border-blue-400'
                            }`}
                            disabled={isReadOnly}
                            data-row={rowIndex}
                            data-col={colIndex}
                          />
                          {currentGrade.score && (
                            <div className="text-center space-y-1">
                              <div className="text-xs font-bold text-blue-700">
                                {currentGrade.percentage}%
                              </div>
                              <Badge 
                                variant={
                                  currentGrade.percentage >= 70 
                                    ? "default" 
                                    : currentGrade.percentage >= 50 
                                    ? "secondary" 
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {currentGrade.letter_grade}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}

                  {/* Summary Column */}
                  <TableCell className="p-3 bg-gradient-to-r from-green-50 to-blue-50 text-center sticky right-0 z-10 border-l-2 border-border">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-800">
                        {stats.totalScore > 0 ? `${stats.totalScore}/${stats.totalPossible}` : '-'}
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {stats.percentage > 0 ? `${stats.percentage}%` : '-'}
                      </div>
                      {stats.position && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-white">
                          <TrendingUp className="h-3 w-3" />
                          #{stats.position}
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Avg: {stats.average > 0 ? `${stats.average}%` : '-'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer Summary */}
      <div className="border-t bg-gray-50 px-4 py-3 text-xs text-muted-foreground mt-4 rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <span><strong>{students.length}</strong> students</span>
            <span><strong>{subjects.length}</strong> subjects</span>
            <span><strong>{students.length * subjects.length}</strong> total grades</span>
          </div>
          <div className="text-right">
            {isReadOnly ? (
              <span className="text-orange-600 font-medium">🔒 Read-only mode</span>
            ) : (
              <span className="text-green-600">💡 Enter scores (0-100) • Use Tab/Enter to navigate</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkGradingSheet;
