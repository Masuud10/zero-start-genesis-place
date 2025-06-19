
import React, { useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
};

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
  const isCBC = curriculumType === 'cbc';

  const cbcLevels = [
    { value: 'exceeding', label: 'Exceeding Expectations (EE)', color: 'bg-green-100 text-green-800' },
    { value: 'meeting', label: 'Meeting Expectations (ME)', color: 'bg-blue-100 text-blue-800' },
    { value: 'approaching', label: 'Approaching Expectations (AE)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'below', label: 'Below Expectations (BE)', color: 'bg-red-100 text-red-800' }
  ];

  const getLetterGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Calculate student totals and positions
  const studentTotals = useMemo(() => {
    const totals = students.map(student => {
      const studentGrades = grades[student.id] || {};
      let totalScore = 0;
      let totalPossible = 0;
      let subjectCount = 0;

      subjects.forEach(subject => {
        const grade = studentGrades[subject.id];
        if (grade?.score && grade.score > 0) {
          totalScore += grade.score;
          totalPossible += 100; // Assuming max score of 100 per subject
          subjectCount++;
        }
      });

      const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;

      return {
        studentId: student.id,
        totalScore,
        totalPossible,
        percentage,
        averageScore,
        subjectCount
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
    const score = value === '' ? null : parseFloat(value);
    const percentage = score !== null ? (score / 100) * 100 : null;
    const letter_grade = score !== null ? getLetterGrade(score) : null;
    
    onGradeChange(studentId, subjectId, {
      score,
      percentage,
      letter_grade
    });
  };

  const handleCBCLevelChange = (studentId: string, subjectId: string, level: string) => {
    onGradeChange(studentId, subjectId, {
      cbc_performance_level: level,
      score: null,
      percentage: null,
      letter_grade: null
    });
  };

  return (
    <div className="w-full overflow-auto border rounded-lg bg-white">
      <div className="min-w-fit">
        {/* Header */}
        <div className="bg-gray-50 border-b p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>Class: {selectedClass}</span>
            <span>•</span>
            <span>Term: {selectedTerm}</span>
            <span>•</span>
            <span>Exam: {selectedExamType}</span>
            {isReadOnly && (
              <Badge variant="secondary" className="ml-2">Read Only</Badge>
            )}
          </div>
        </div>

        {/* Table with wider layout */}
        <div className="grid" style={{ 
          gridTemplateColumns: `320px repeat(${subjects.length}, minmax(200px, 1fr)) 200px` 
        }}>
          {/* Header Row */}
          <div className="bg-gray-100 p-4 border-r border-b font-semibold text-gray-800 sticky left-0 z-20">
            Student Information
          </div>
          {subjects.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-gray-100 p-4 border-r border-b font-semibold text-gray-800 text-center"
            >
              <div className="font-medium text-sm">{subject.name}</div>
              {subject.code && (
                <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
              )}
              <div className="text-xs text-gray-500 mt-1">Max: 100</div>
            </div>
          ))}
          
          {/* Totals Column Header */}
          <div className="bg-blue-100 p-4 border-b font-semibold text-blue-800 text-center">
            <div className="font-medium">Summary</div>
            <div className="text-xs text-blue-600 mt-1">Total | % | Position</div>
          </div>

          {/* Student Rows */}
          {students.map((student, studentIndex) => {
            const studentTotal = studentTotals.find(t => t.studentId === student.id);
            
            return (
              <React.Fragment key={student.id}>
                {/* Student Name Cell */}
                <div className={`p-4 border-r border-b sticky left-0 z-10 ${
                  studentIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <div className="font-medium text-sm mb-1">{student.name}</div>
                  {student.admission_number && (
                    <div className="text-xs text-gray-600 mb-1">
                      Adm: {student.admission_number}
                    </div>
                  )}
                  {student.roll_number && (
                    <div className="text-xs text-gray-600">
                      Roll: {student.roll_number}
                    </div>
                  )}
                </div>

                {/* Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  
                  return (
                    <div 
                      key={`${student.id}-${subject.id}`}
                      className={`p-3 border-r border-b ${
                        studentIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } ${isReadOnly ? 'opacity-75' : ''}`}
                    >
                      {isCBC ? (
                        <div className="space-y-2">
                          <Select
                            value={gradeValue?.cbc_performance_level || ''}
                            onValueChange={(value) => handleCBCLevelChange(student.id, subject.id, value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className="w-full h-10 text-xs">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {cbcLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${level.color.split(' ')[0]}`} />
                                    <span className="text-xs">{level.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {gradeValue?.cbc_performance_level && (
                            <Badge 
                              variant="secondary" 
                              className={cbcLevels.find(l => l.value === gradeValue.cbc_performance_level)?.color || ''}
                            >
                              {gradeValue.cbc_performance_level.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0-100"
                            value={gradeValue?.score || ''}
                            onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                            disabled={isReadOnly}
                            className="w-full h-10 text-center text-sm font-medium"
                          />
                          
                          {gradeValue?.score !== null && gradeValue?.score !== undefined && (
                            <div className="flex items-center justify-between text-xs">
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {gradeValue.letter_grade}
                              </Badge>
                              <span className="text-gray-600 font-medium">
                                {gradeValue.percentage?.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Totals Cell */}
                <div className={`p-3 border-b ${
                  studentIndex % 2 === 0 ? 'bg-blue-50' : 'bg-blue-25'
                } text-center`}>
                  {studentTotal && studentTotal.subjectCount > 0 ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-blue-800">
                        {studentTotal.totalScore.toFixed(1)}/{studentTotal.totalPossible}
                      </div>
                      <div className="text-sm font-semibold text-blue-700">
                        {studentTotal.percentage.toFixed(1)}%
                      </div>
                      <Badge variant="default" className="text-xs bg-blue-600">
                        Position: {studentTotal.position}
                      </Badge>
                      <div className="text-xs text-blue-600">
                        {studentTotal.subjectCount} subjects
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No grades yet</div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BulkGradingSheet;
