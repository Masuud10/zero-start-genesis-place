
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

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
  raw_score?: number;
  letter_grade?: string;
  percentage?: number;
  isAbsent?: boolean;
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

const IGCSE_GRADE_BOUNDARIES = {
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

const DEFAULT_WEIGHTINGS = {
  coursework: 30,
  exam: 70
};

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
  const [subjectWeightings, setSubjectWeightings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIGCSEConfigurations();
  }, [selectedClass, subjects]);

  const loadIGCSEConfigurations = async () => {
    if (!schoolId || subjects.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('grading_configurations')
        .select('*')
        .eq('school_id', schoolId)
        .eq('curriculum_type', 'igcse')
        .in('subject_id', subjects.map(s => s.id));

      if (error) throw error;

      const weightingsMap: Record<string, any> = {};
      data?.forEach(config => {
        weightingsMap[config.subject_id] = {
          coursework_percentage: config.coursework_percentage || DEFAULT_WEIGHTINGS.coursework,
          exam_percentage: config.exam_percentage || DEFAULT_WEIGHTINGS.exam,
          grade_boundaries: config.grade_boundaries || IGCSE_GRADE_BOUNDARIES
        };
      });

      // Set default weightings for subjects without configuration
      subjects.forEach(subject => {
        if (!weightingsMap[subject.id]) {
          weightingsMap[subject.id] = {
            coursework_percentage: DEFAULT_WEIGHTINGS.coursework,
            exam_percentage: DEFAULT_WEIGHTINGS.exam,
            grade_boundaries: IGCSE_GRADE_BOUNDARIES
          };
        }
      });

      setSubjectWeightings(weightingsMap);
    } catch (error) {
      console.error('Error loading IGCSE configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIGCSEGrade = (courseworkScore: number, examScore: number, subjectId: string) => {
    const config = subjectWeightings[subjectId];
    if (!config) return { grade: 'U', percentage: 0, rawScore: 0 };

    const rawScore = (courseworkScore * config.coursework_percentage / 100) + 
                     (examScore * config.exam_percentage / 100);
    
    const percentage = rawScore;
    
    // Apply grade boundaries
    let grade = 'U';
    const boundaries = config.grade_boundaries;
    
    for (const [gradeLevel, boundary] of Object.entries(boundaries)) {
      if (percentage >= boundary) {
        grade = gradeLevel;
        break;
      }
    }

    return { grade, percentage, rawScore };
  };

  const handleScoreChange = (
    studentId: string, 
    subjectId: string, 
    scoreType: 'coursework' | 'exam', 
    value: string
  ) => {
    if (isReadOnly) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    const score = value === '' ? 0 : parseFloat(value);

    const newGrade = {
      ...currentGrade,
      [`${scoreType}_score`]: score,
      isAbsent: false
    };

    // Calculate final grade if both scores are present
    if (newGrade.coursework_score !== undefined && newGrade.exam_score !== undefined) {
      const result = calculateIGCSEGrade(
        newGrade.coursework_score || 0, 
        newGrade.exam_score || 0, 
        subjectId
      );
      
      newGrade.raw_score = result.rawScore;
      newGrade.percentage = result.percentage;
      newGrade.letter_grade = result.grade;
    }

    onGradeChange(studentId, subjectId, newGrade);
  };

  const handleAbsentChange = (studentId: string, subjectId: string, isAbsent: boolean) => {
    if (isReadOnly) return;

    onGradeChange(studentId, subjectId, {
      coursework_score: isAbsent ? null : undefined,
      exam_score: isAbsent ? null : undefined,
      raw_score: null,
      percentage: null,
      letter_grade: null,
      isAbsent,
      comments: isAbsent ? 'Student was absent' : ''
    });
  };

  const getGradeBadgeColor = (grade: string) => {
    if (['A*', 'A'].includes(grade)) return 'bg-green-100 text-green-800 border-green-200';
    if (['B', 'C'].includes(grade)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['D', 'E'].includes(grade)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (['F', 'G'].includes(grade)) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-gray-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <span>Class: <strong>{selectedClass}</strong></span>
          <span>•</span>
          <span>Term: <strong>{selectedTerm}</strong></span>
          <span>•</span>
          <span>Exam: <strong>{selectedExamType}</strong></span>
          <span>•</span>
          <span>Curriculum: <strong>IGCSE</strong></span>
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
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => {
                const weighting = subjectWeightings[subject.id];
                return (
                  <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[350px]">
                    <div className="font-medium text-sm">{subject.name}</div>
                    {subject.code && (
                      <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                    )}
                    {weighting && (
                      <div className="text-xs text-gray-500 mt-1">
                        Coursework: {weighting.coursework_percentage}% | Exam: {weighting.exam_percentage}%
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">IGCSE Grading</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {students.map((student, studentIndex) => (
              <tr key={student.id} className={`${studentIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'} hover:bg-blue-25 transition-colors`}>
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

                {/* IGCSE Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  const weighting = subjectWeightings[subject.id];
                  
                  return (
                    <td key={`${student.id}-${subject.id}`} className="border border-gray-300 p-2">
                      <div className="space-y-3">
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

                        {!gradeValue?.isAbsent && (
                          <>
                            {/* Coursework Score */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-700">
                                Coursework ({weighting?.coursework_percentage}%):
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="0-100"
                                value={gradeValue?.coursework_score || ''}
                                onChange={(e) => handleScoreChange(
                                  student.id, 
                                  subject.id, 
                                  'coursework', 
                                  e.target.value
                                )}
                                disabled={isReadOnly}
                                className="h-7 text-xs"
                              />
                            </div>

                            {/* Exam Score */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-gray-700">
                                Exam ({weighting?.exam_percentage}%):
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="0-100"
                                value={gradeValue?.exam_score || ''}
                                onChange={(e) => handleScoreChange(
                                  student.id, 
                                  subject.id, 
                                  'exam', 
                                  e.target.value
                                )}
                                disabled={isReadOnly}
                                className="h-7 text-xs"
                              />
                            </div>

                            {/* Final Grade Display */}
                            {gradeValue?.letter_grade && (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-center">
                                  <Badge 
                                    className={`text-sm font-bold px-3 py-1 ${getGradeBadgeColor(gradeValue.letter_grade)}`}
                                  >
                                    {gradeValue.letter_grade}
                                  </Badge>
                                </div>
                                <div className="text-center text-xs text-gray-600">
                                  Raw Score: {gradeValue.raw_score?.toFixed(1)}%
                                </div>
                                <div className="text-center text-xs text-gray-600">
                                  Final: {gradeValue.percentage?.toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {gradeValue?.isAbsent && (
                          <div className="text-center">
                            <Badge variant="destructive" className="text-xs">
                              ABSENT
                            </Badge>
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
