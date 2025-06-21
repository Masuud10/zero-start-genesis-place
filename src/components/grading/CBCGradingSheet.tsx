
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { CBCCompetency } from '@/types/grading';

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
  strand_scores?: Record<string, number>;
  competency_level?: string;
  overall_score?: number;
  comments?: string;
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
  const [competencies, setCompetencies] = useState<CBCCompetency[]>([]);

  useEffect(() => {
    loadCompetencies();
  }, [schoolId, selectedClass]);

  const loadCompetencies = async () => {
    if (!schoolId || !selectedClass) return;

    try {
      const { data, error } = await supabase
        .from('cbc_competencies')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass);

      if (error) throw error;
      
      // Convert Json strands to array
      const processedData = (data || []).map(comp => ({
        ...comp,
        strands: Array.isArray(comp.strands) ? comp.strands : 
                 typeof comp.strands === 'string' ? JSON.parse(comp.strands) : []
      })) as CBCCompetency[];
      
      setCompetencies(processedData);
    } catch (error) {
      console.error('Error loading CBC competencies:', error);
    }
  };

  const calculateCompetencyLevel = (strandScores: Record<string, number>): string => {
    if (!strandScores || Object.keys(strandScores).length === 0) {
      return 'Not Assessed';
    }

    const scores = Object.values(strandScores);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (average >= 4) return 'Exceeding Expectations';
    if (average >= 3) return 'Meeting Expectations';
    if (average >= 2) return 'Approaching Expectations';
    return 'Below Expectations';
  };

  const handleStrandScoreChange = (studentId: string, subjectId: string, strandName: string, score: number) => {
    if (isReadOnly) return;

    const currentGrade = grades[studentId]?.[subjectId] || {};
    const currentStrandScores = currentGrade.strand_scores || {};
    
    const newStrandScores = {
      ...currentStrandScores,
      [strandName]: score
    };

    const competencyLevel = calculateCompetencyLevel(newStrandScores);
    const overallScore = Object.values(newStrandScores).reduce((sum, s) => sum + s, 0) / Object.values(newStrandScores).length;

    onGradeChange(studentId, subjectId, {
      ...currentGrade,
      strand_scores: newStrandScores,
      competency_level: competencyLevel,
      overall_score: overallScore
    });
  };

  const getCompetencyColor = (level: string): string => {
    switch (level) {
      case 'Exceeding Expectations': return 'bg-green-100 text-green-800 border-green-200';
      case 'Meeting Expectations': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Approaching Expectations': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Below Expectations': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full h-[600px] overflow-auto border rounded-lg bg-white">
      {/* Header Info */}
      <div className="bg-blue-50 border-b p-3 sticky top-0 z-30">
        <div className="flex items-center gap-4 text-sm font-medium text-blue-800">
          <span>CBC Competency-Based Assessment</span>
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

      {/* CBC Grading Table */}
      <div className="min-w-fit">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gray-100 sticky top-[60px] z-20">
            <tr>
              <th className="border border-gray-300 p-3 text-left font-semibold min-w-[280px] sticky left-0 bg-gray-100 z-25">
                Student Information
              </th>
              {subjects.map((subject) => (
                <th key={subject.id} className="border border-gray-300 p-3 text-center font-semibold min-w-[300px]">
                  <div className="font-medium text-sm">{subject.name}</div>
                  {subject.code && (
                    <div className="text-xs text-gray-600 mt-1">{subject.code}</div>
                  )}
                  <div className="text-xs text-blue-600 mt-1">CBC Competency Assessment</div>
                </th>
              ))}
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

                {/* Subject Grade Cells */}
                {subjects.map((subject) => {
                  const gradeValue = grades[student.id]?.[subject.id];
                  const subjectCompetencies = competencies.filter(comp => comp.subject_id === subject.id);
                  
                  return (
                    <td key={`${student.id}-${subject.id}`} className="border border-gray-300 p-2">
                      <div className="space-y-3">
                        {/* Strand Assessments */}
                        {subjectCompetencies.length > 0 ? (
                          <div className="space-y-2">
                            {subjectCompetencies.map((competency) => (
                              <div key={competency.id} className="border rounded p-2 bg-gray-50">
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                  {competency.competency_name}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                  {competency.strands.map((strand: any, index: number) => (
                                    <div key={index} className="space-y-1">
                                      <label className="text-xs text-gray-600">
                                        {typeof strand === 'string' ? strand : strand.name || `Strand ${index + 1}`}
                                      </label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="4"
                                        step="1"
                                        placeholder="1-4"
                                        value={gradeValue?.strand_scores?.[strand] || ''}
                                        onChange={(e) => {
                                          const score = parseInt(e.target.value);
                                          if (score >= 1 && score <= 4) {
                                            handleStrandScoreChange(student.id, subject.id, strand, score);
                                          }
                                        }}
                                        disabled={isReadOnly}
                                        className="h-7 text-xs text-center"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic text-center py-4">
                            No competencies configured for this subject
                          </div>
                        )}

                        {/* Overall Competency Level */}
                        {gradeValue?.competency_level && (
                          <div className="mt-3 text-center">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-1 ${getCompetencyColor(gradeValue.competency_level)}`}
                            >
                              {gradeValue.competency_level}
                            </Badge>
                            {gradeValue.overall_score && (
                              <div className="text-xs text-gray-600 mt-1">
                                Score: {gradeValue.overall_score.toFixed(1)}/4
                              </div>
                            )}
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
