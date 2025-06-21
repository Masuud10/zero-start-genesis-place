
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { IGCSEGradeBoundaries } from '@/types/grading';

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

interface IGCSEGradeValue {
  coursework_score?: number;
  exam_score?: number;
  total_score?: number;
  percentage?: number;
  letter_grade?: string;
  comments?: string;
}

interface IGCSEGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, IGCSEGradeValue>>;
  onGradeChange: (studentId: string, subjectId: string, value: IGCSEGradeValue) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
}

export const IGCSEGradingSheet: React.FC<IGCSEGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType
}) => {
  const { schoolId } = useSchoolScopedData();
  const [gradingConfigs, setGradingConfigs] = useState<any[]>([]);

  // Default IGCSE grade boundaries
  const defaultGradeBoundaries: IGCSEGradeBoundaries = {
    'A*': 90,
    'A': 80,
    'B': 70,
    'C': 60,
    'D': 50,
    'E': 40,
    'F': 30,
    'G': 20,
    'U': 0
  };

  useEffect(() => {
    loadGradingConfigurations();
  }, [schoolId, selectedClass]);

  const loadGradingConfigurations = async () => {
    if (!schoolId || !selectedClass) return;

    try {
      const { data, error } = await supabase
        .from('grading_configurations')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .eq('curriculum_type', 'igcse');

      if (error) throw error;
      setGradingConfigs(data || []);
    } catch (error) {
      console.error('Error loading grading configurations:', error);
    }
  };

  const getSubjectConfig = (subjectId: string) => {
    return gradingConfigs.find(config => config.subject_id === subjectId) || {
      coursework_percentage: 30,
      exam_percentage: 70,
      grade_boundaries: defaultGradeBoundaries
    };
  };

  const calculateIGCSEGrade = (courseworkScore: number, examScore: number, subjectId: string): { totalScore: number, percentage: number, letterGrade: string } => {
    const config = getSubjectConfig(subjectId);
    const courseworkWeight = config.coursework_percentage || 30;
    const examWeight = config.exam_percentage || 70;
    
    const totalScore = (courseworkScore * courseworkWeight / 100) + (examScore * examWeight / 100);
    const percentage = totalScore;
    
    // Apply grade boundaries
    const boundaries = config.grade_boundaries || defaultGradeBoundaries;
    let letterGrade = 'U';
    
    // Convert boundaries to array and sort by score descending
    const boundaryEntries = Object.entries(boundaries)
      .map(([grade, score]) => ({ grade, score: Number(score) }))
      .sort((a, b) => b.score - a.score);
    
    for (const boundary of boundaryEntries) {
      if (typeof boundary.score === 'number' && percentage >= boundary.score) {
        letterGrade = boundary.grade;
        break;
      }
    }
    
    return { totalScore, percentage, letterGrade };
  };

  const handleScoreChange = (studentId: string, subjectId: string, field: 'coursework_score' | 'exam_score', value: string) => {
    if (isReadOnly) return;
    
    const score = value === '' ? undefined : parseFloat(value);
    const currentGrade = grades[studentId]?.[subjectId] || {};
    
    const newGrade = {
      ...currentGrade,
      [field]: score
    };

    // Recalculate if both scores are available
    if (newGrade.coursework_score !== undefined && newGrade.exam_score !== undefined) {
      const { totalScore, percentage, letterGrade } = calculateIGCSEGrade(
        newGrade.coursework_score, 
        newGrade.exam_score, 
        subjectId
      );
      
      newGrade.total_score = totalScore;
      newGrade.percentage = percentage;
      newGrade.letter_grade = letterGrade;
    }
    
    onGradeChange(studentId, subjectId, newGrade);
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A*':
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
      case 'E': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
      case 'G':
      case 'U': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-purple-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-purple-800">
          <span>IGCSE Assessment System</span>
          <span>•</span>
          <span>Class: <strong>{selectedClass}</strong></span>
          <span>•</span>
          <span>Term: <strong>{selectedTerm}</strong></span>
          <span>•</span>
          <span>Assessment: <strong>{selectedExamType}</strong></span>
          {isReadOnly && (
            <Badge variant="secondary" className="ml-2">Read Only</Badge>
          )}
        </div>
      </div>

      {/* IGCSE Grading Table */}
      <div className="min-w-fit">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => {
                const config = getSubjectConfig(subject.id);
                return (
                  <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[320px]">
                    <div className="font-medium text-sm">{subject.name}</div>
                    {subject.code && (
                      <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                    )}
                    <div className="text-xs text-purple-600 mt-1">
                      Coursework: {config.coursework_percentage}% | Exam: {config.exam_percentage}%
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {students.map((student, studentIndex) => (
              <tr key={student.id} className={`${studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'} hover:bg-purple-25 transition-colors`}>
                {/* Student Info Cell */}
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

                {/* Subject Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  const config = getSubjectConfig(subject.id);
                  
                  return (
                    <td key={`${student.id}-${subject.id}`} className="border border-gray-300 p-2">
                      <div className="space-y-3">
                        {/* Coursework and Exam Scores */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                              Coursework ({config.coursework_percentage}%)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              placeholder="0-100"
                              value={gradeValue?.coursework_score || ''}
                              onChange={(e) => handleScoreChange(student.id, subject.id, 'coursework_score', e.target.value)}
                              disabled={isReadOnly}
                              className="h-8 text-xs text-center"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                              Exam ({config.exam_percentage}%)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              placeholder="0-100"
                              value={gradeValue?.exam_score || ''}
                              onChange={(e) => handleScoreChange(student.id, subject.id, 'exam_score', e.target.value)}
                              disabled={isReadOnly}
                              className="h-8 text-xs text-center"
                            />
                          </div>
                        </div>

                        {/* Calculated Results */}
                        {gradeValue?.total_score !== undefined && (
                          <div className="bg-purple-50 border border-purple-200 rounded p-2 space-y-2">
                            <div className="text-xs text-center">
                              <div className="font-semibold text-purple-800">
                                Total: {gradeValue.total_score.toFixed(1)}%
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-3 py-1 font-bold ${getGradeColor(gradeValue.letter_grade || '')}`}
                              >
                                {gradeValue.letter_grade}
                              </Badge>
                            </div>
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
