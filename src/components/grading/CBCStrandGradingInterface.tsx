
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { CheckCircle, Target, TrendingUp, MessageSquare } from 'lucide-react';

interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  strands: string[];
  sub_strands: string[];
  weighting: number;
}

interface CBCStrandGradeValue {
  performance_level: 'EM' | 'AP' | 'PR' | 'EX';
  strand_scores: Record<string, string>; // strand name -> performance level
  teacher_remarks: string;
  assessment_type: string;
}

interface CBCStrandGradingInterfaceProps {
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  examType: string;
  value: CBCStrandGradeValue;
  onChange: (value: CBCStrandGradeValue) => void;
  isReadOnly?: boolean;
}

const CBC_PERFORMANCE_LEVELS = [
  { value: 'EX', label: 'Exemplary', color: 'bg-green-100 text-green-800', description: 'Consistently demonstrates exceptional understanding' },
  { value: 'PR', label: 'Proficient', color: 'bg-blue-100 text-blue-800', description: 'Demonstrates good understanding and application' },
  { value: 'AP', label: 'Approaching Proficiency', color: 'bg-yellow-100 text-yellow-800', description: 'Shows developing understanding with support' },
  { value: 'EM', label: 'Emerging', color: 'bg-red-100 text-red-800', description: 'Beginning to show understanding' }
];

const ASSESSMENT_TYPES = [
  { value: 'observation', label: 'Observation' },
  { value: 'written_work', label: 'Written Work' },
  { value: 'project_work', label: 'Project Work' },
  { value: 'group_activity', label: 'Group Activity' },
  { value: 'oral_assessment', label: 'Oral Assessment' },
  { value: 'practical_work', label: 'Practical Work' }
];

export const CBCStrandGradingInterface: React.FC<CBCStrandGradingInterfaceProps> = ({
  studentId,
  subjectId,
  classId,
  term,
  examType,
  value,
  onChange,
  isReadOnly = false
}) => {
  const { schoolId } = useSchoolScopedData();
  const [competencies, setCompetencies] = useState<CBCCompetency[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompetencies();
  }, [subjectId, classId]);

  const loadCompetencies = async () => {
    if (!subjectId || !schoolId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cbc_competencies')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('school_id', schoolId)
        .order('competency_name');

      if (error) throw error;

      const processedCompetencies = (data || []).map(comp => ({
        ...comp,
        strands: Array.isArray(comp.strands) ? comp.strands : 
                 typeof comp.strands === 'string' ? JSON.parse(comp.strands) : [],
        sub_strands: Array.isArray(comp.sub_strands) ? comp.sub_strands : 
                     typeof comp.sub_strands === 'string' ? JSON.parse(comp.sub_strands) : []
      })) as CBCCompetency[];

      setCompetencies(processedCompetencies);
    } catch (error) {
      console.error('Error loading CBC competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrandScoreChange = (strandName: string, performanceLevel: string) => {
    if (isReadOnly) return;

    const newStrandScores = {
      ...value.strand_scores,
      [strandName]: performanceLevel
    };

    onChange({
      ...value,
      strand_scores: newStrandScores,
      performance_level: calculateOverallPerformance(newStrandScores)
    });
  };

  const calculateOverallPerformance = (strandScores: Record<string, string>): 'EM' | 'AP' | 'PR' | 'EX' => {
    const scores = Object.values(strandScores).filter(score => score);
    if (scores.length === 0) return 'EM';

    const levelValues = { 'EM': 1, 'AP': 2, 'PR': 3, 'EX': 4 };
    const average = scores.reduce((sum, level) => sum + (levelValues[level as keyof typeof levelValues] || 1), 0) / scores.length;

    if (average >= 3.5) return 'EX';
    if (average >= 2.5) return 'PR';
    if (average >= 1.5) return 'AP';
    return 'EM';
  };

  const handleRemarksChange = (remarks: string) => {
    if (isReadOnly) return;
    onChange({
      ...value,
      teacher_remarks: remarks
    });
  };

  const handleAssessmentTypeChange = (assessmentType: string) => {
    if (isReadOnly) return;
    onChange({
      ...value,
      assessment_type: assessmentType
    });
  };

  const getPerformanceLevelInfo = (level: string) => {
    return CBC_PERFORMANCE_LEVELS.find(l => l.value === level) || CBC_PERFORMANCE_LEVELS[3];
  };

  const getStrandName = (strand: any, index: number): string => {
    if (typeof strand === 'string') {
      return strand;
    }
    if (strand && typeof strand === 'object' && strand.name) {
      return strand.name;
    }
    return `Strand ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assessment Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={value.assessment_type || ''}
            onValueChange={handleAssessmentTypeChange}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assessment type" />
            </SelectTrigger>
            <SelectContent>
              {ASSESSMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Overall Performance Level Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={`${getPerformanceLevelInfo(value.performance_level).color} text-sm px-3 py-1`}>
                {getPerformanceLevelInfo(value.performance_level).label} ({value.performance_level})
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {getPerformanceLevelInfo(value.performance_level).description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strand Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Strand Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {competencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No competencies configured for this subject</p>
              <p className="text-sm">Contact administrator to set up CBC competencies</p>
            </div>
          ) : (
            competencies.map((competency) => (
              <div key={competency.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{competency.competency_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {competency.competency_code}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {competency.strands.map((strand, index) => {
                    const strandName = getStrandName(strand, index);
                    const currentLevel = value.strand_scores?.[strandName] || '';
                    
                    return (
                      <div key={`${strandName}_${index}`} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {strandName}
                        </label>
                        <Select
                          value={currentLevel}
                          onValueChange={(level) => handleStrandScoreChange(strandName, level)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {CBC_PERFORMANCE_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-3 h-3 rounded-full ${level.color.replace('text-', 'bg-').replace('bg-', 'bg-')}`}></span>
                                  {level.label} ({level.value})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Teacher Remarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Teacher Remarks & Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter specific observations, strengths, and areas for improvement..."
            value={value.teacher_remarks || ''}
            onChange={(e) => handleRemarksChange(e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className="w-full"
          />
          <div className="mt-2 text-sm text-gray-500">
            Provide specific, constructive feedback based on CBC assessment criteria
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
