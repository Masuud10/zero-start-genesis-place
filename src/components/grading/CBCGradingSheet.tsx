
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface CBCGradeValue {
  competency_level?: string;
  strand_scores?: Record<string, number>;
  isAbsent?: boolean;
  comments?: string;
  overall_score?: number;
}

interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  strands: any[];
}

interface CBCGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, CBCGradeValue>>;
  onGradeChange: (studentId: string, subjectId: string, value: CBCGradeValue) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
}

const CBC_COMPETENCY_LEVELS = [
  { value: 'Exceeding Expectations', label: 'Exceeding Expectations', color: 'bg-green-100 text-green-800' },
  { value: 'Meeting Expectations', label: 'Meeting Expectations', color: 'bg-blue-100 text-blue-800' },
  { value: 'Approaching Expectations', label: 'Approaching Expectations', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Below Expectations', label: 'Below Expectations', color: 'bg-red-100 text-red-800' }
];

export const CBCGradingSheet: React.FC<CBCGradingSheetProps> = ({
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
  const [competencies, setCompetencies] = useState<Record<string, CBCCompetency>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCBCCompetencies();
  }, [selectedClass, subjects]);

  const loadCBCCompetencies = async () => {
    if (!schoolId || subjects.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('cbc_competencies')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .in('subject_id', subjects.map(s => s.id));

      if (error) throw error;

      const competenciesMap: Record<string, CBCCompetency> = {};
      data?.forEach(comp => {
        competenciesMap[comp.subject_id] = comp;
      });

      setCompetencies(competenciesMap);
    } catch (error) {
      console.error('Error loading CBC competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompetencyLevel = (strandScores: Record<string, number>) => {
    const scores = Object.values(strandScores).filter(score => score > 0);
    if (scores.length === 0) return 'Not Assessed';

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (average >= 80) return 'Exceeding Expectations';
    if (average >= 60) return 'Meeting Expectations';
    if (average >= 40) return 'Approaching Expectations';
    return 'Below Expectations';
  };

  const handleStrandScoreChange = (studentId: string, subjectId: string, strandKey: string, score: string) => {
    if (isReadOnly) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    const newStrandScores = {
      ...currentGrade.strand_scores,
      [strandKey]: score === '' ? 0 : parseFloat(score)
    };

    const competencyLevel = calculateCompetencyLevel(newStrandScores);
    const overallScore = Object.values(newStrandScores).reduce((sum: number, score: number) => sum + score, 0) / Object.keys(newStrandScores).length;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      strand_scores: newStrandScores,
      competency_level: competencyLevel,
      overall_score: overallScore,
      isAbsent: false
    });
  };

  const handleCompetencyLevelChange = (studentId: string, subjectId: string, level: string) => {
    if (isReadOnly) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      competency_level: level,
      isAbsent: false
    });
  };

  const handleAbsentChange = (studentId: string, subjectId: string, isAbsent: boolean) => {
    if (isReadOnly) return;

    onGradeChange(studentId, subjectId, {
      competency_level: isAbsent ? null : undefined,
      strand_scores: isAbsent ? {} : undefined,
      isAbsent,
      comments: isAbsent ? 'Student was absent' : ''
    });
  };

  const getCompetencyLevelBadge = (level: string) => {
    const levelInfo = CBC_COMPETENCY_LEVELS.find(l => l.value === level);
    return levelInfo ? (
      <Badge className={`text-xs ${levelInfo.color}`}>
        {levelInfo.label}
      </Badge>
    ) : null;
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
          <span>Curriculum: <strong>CBC (Competency-Based)</strong></span>
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
                const competency = competencies[subject.id];
                return (
                  <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[300px]">
                    <div className="font-medium text-sm">{subject.name}</div>
                    {subject.code && (
                      <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                    )}
                    {competency && (
                      <div className="text-xs text-gray-500 mt-1">
                        {competency.competency_name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">CBC Assessment</div>
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

                {/* CBC Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  const competency = competencies[subject.id];
                  
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
                            {/* Strand Scores */}
                            {competency?.strands && Array.isArray(competency.strands) && competency.strands.length > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-700">Strand Scores:</div>
                                {competency.strands.map((strand: any, index: number) => (
                                  <div key={index} className="space-y-1">
                                    <label className="text-xs text-gray-600">{strand.name || `Strand ${index + 1}`}</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="1"
                                      placeholder="0-100"
                                      value={gradeValue?.strand_scores?.[strand.name || `strand_${index}`] || ''}
                                      onChange={(e) => handleStrandScoreChange(
                                        student.id, 
                                        subject.id, 
                                        strand.name || `strand_${index}`, 
                                        e.target.value
                                      )}
                                      disabled={isReadOnly}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Overall Competency Level Selection */
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700">Competency Level:</label>
                                <Select
                                  value={gradeValue?.competency_level || ''}
                                  onValueChange={(value) => handleCompetencyLevelChange(student.id, subject.id, value)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CBC_COMPETENCY_LEVELS.map(level => (
                                      <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Competency Level Display */}
                            {gradeValue?.competency_level && (
                              <div className="flex justify-center">
                                {getCompetencyLevelBadge(gradeValue.competency_level)}
                              </div>
                            )}

                            {/* Overall Score Display */}
                            {gradeValue?.overall_score && (
                              <div className="text-center">
                                <div className="text-xs font-medium text-gray-700">
                                  Overall: {gradeValue.overall_score.toFixed(1)}%
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
