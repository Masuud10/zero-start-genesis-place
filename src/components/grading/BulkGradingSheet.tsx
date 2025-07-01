
import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CBCGradingSheet } from './CBCGradingSheet';

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
  performance_level?: 'EM' | 'AP' | 'PR' | 'EX';
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
  // Route to CBC grading sheet for CBC curriculum
  if (curriculumType.toUpperCase() === 'CBC') {
    return (
      <CBCGradingSheet
        students={students}
        subjects={subjects}
        grades={grades}
        onGradeChange={onGradeChange}
        isReadOnly={isReadOnly}
        selectedClass={selectedClass}
        selectedTerm={selectedTerm}
        selectedExamType={selectedExamType}
      />
    );
  }

  // Standard/IGCSE grading sheet (existing functionality)
  const handleScoreChange = (studentId: string, subjectId: string, score: string) => {
    if (isReadOnly) return;
    
    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return;
    
    const percentage = (numericScore / 100) * 100;
    let letterGrade = 'F';
    
    if (percentage >= 90) letterGrade = 'A+';
    else if (percentage >= 80) letterGrade = 'A';
    else if (percentage >= 70) letterGrade = 'B+';
    else if (percentage >= 60) letterGrade = 'B';
    else if (percentage >= 50) letterGrade = 'C+';
    else if (percentage >= 40) letterGrade = 'C';
    else if (percentage >= 30) letterGrade = 'D+';
    else if (percentage >= 20) letterGrade = 'D';
    else letterGrade = 'E';

    onGradeChange(studentId, subjectId, {
      score: numericScore,
      percentage,
      letter_grade: letterGrade
    });
  };

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-blue-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-blue-800">
          <span>{curriculumType.toUpperCase()} Grading Sheet</span>
          <span>•</span>
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

      {/* Standard Grading Table */}
      <div className="min-w-fit">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => (
                <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[150px]">
                  <div className="font-medium text-sm">{subject.name}</div>
                  {subject.code && (
                    <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, studentIndex) => (
              <tr key={student.id} className={`${studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'} hover:bg-blue-25 transition-colors`}>
                <td className={`border border-gray-300 p-3 sticky left-0 z-10 ${
                  studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                }`}>
                  <div className="font-medium text-sm mb-1">{student.name}</div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    {student.admission_number && (
                      <span>Adm# {student.admission_number}</span>
                    )}
                    {student.roll_number && (
                      <span>Roll# {student.roll_number}</span>
                    )}
                  </div>
                </td>
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  
                  return (
                    <td key={`${student.id}-${subject.id}`} className="border border-gray-300 p-2">
                      <div className="space-y-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="Score"
                          value={gradeValue?.score || ''}
                          onChange={(e) => handleScoreChange(student.id, subject.id, e.target.value)}
                          disabled={isReadOnly}
                          className="h-8 text-center"
                        />
                        {gradeValue?.letter_grade && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {gradeValue.letter_grade}
                            </Badge>
                          </div>
                        )}
                        {gradeValue?.percentage && (
                          <div className="text-xs text-gray-600 text-center">
                            {gradeValue.percentage.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulkGradingSheet;
