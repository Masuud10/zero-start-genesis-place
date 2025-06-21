
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { CheckCircle, Target, TrendingUp, MessageSquare } from 'lucide-react';

interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  strands: string[];
  weighting: number;
}

interface CBCGradeValue {
  competency_level: 'EM' | 'ME' | 'AE' | 'BE'; // Exceeding, Meeting, Approaching, Below Expectations
  strand_scores: Record<string, number>; // 1-4 scale per strand
  overall_rating: number;
  teacher_remarks: string;
  competency_mastery: string[];
  areas_for_improvement: string[];
}

interface CBCGradingInterfaceProps {
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  examType: string;
  value: CBCGradeValue;
  onChange: (value: CBCGradeValue) => void;
  isReadOnly?: boolean;
}

const CBC_LEVELS = [
  { value: 'EM', label: 'Exceeding Expectations', color: 'bg-green-100 text-green-800', description: 'Demonstrates exceptional understanding and skills' },
  { value: 'ME', label: 'Meeting Expectations', color: 'bg-blue-100 text-blue-800', description: 'Demonstrates adequate understanding and skills' },
  { value: 'AE', label: 'Approaching Expectations', color: 'bg-yellow-100 text-yellow-800', description: 'Shows developing understanding and skills' },
  { value: 'BE', label: 'Below Expectations', color: 'bg-red-100 text-red-800', description: 'Needs additional support to develop skills' }
];

export const CBCGradingInterface: React.FC<CBCGradingInterfaceProps> = ({
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
                 typeof comp.strands === 'string' ? JSON.parse(comp.strands) : []
      })) as CBCCompetency[];

      setCompetencies(processedCompetencies);
    } catch (error) {
      console.error('Error loading CBC competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallRating = (strandScores: Record<string, number>): number => {
    const scores = Object.values(strandScores).filter(score => score > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const determineCompetencyLevel = (overallRating: number): 'EM' | 'ME' | 'AE' | 'BE' => {
    if (overallRating >= 3.5) return 'EM';
    if (overallRating >= 2.5) return 'ME';
    if (overallRating >= 1.5) return 'AE';
    return 'BE';
  };

  const handleStrandScoreChange = (competencyId: string, strandName: string, score: number) => {
    if (isReadOnly) return;

    const newStrandScores = {
      ...value.strand_scores,
      [`${competencyId}_${strandName}`]: score
    };

    const overallRating = calculateOverallRating(newStrandScores);
    const competencyLevel = determineCompetencyLevel(overallRating);

    onChange({
      ...value,
      strand_scores: newStrandScores,
      overall_rating: overallRating,
      competency_level: competencyLevel
    });
  };

  const handleRemarksChange = (remarks: string) => {
    if (isReadOnly) return;
    onChange({
      ...value,
      teacher_remarks: remarks
    });
  };

  const getCompetencyLevelInfo = (level: string) => {
    return CBC_LEVELS.find(l => l.value === level) || CBC_LEVELS[3];
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
      {/* Overall Competency Level Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Competency Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={`${getCompetencyLevelInfo(value.competency_level).color} text-sm px-3 py-1`}>
                {getCompetencyLevelInfo(value.competency_level).label}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {getCompetencyLevelInfo(value.competency_level).description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {value.overall_rating ? value.overall_rating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-500">Overall Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Strands Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Competency Strands Assessment
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {competency.strands.map((strand, index) => {
                    const strandKey = `${competency.id}_${strand}`;
                    const currentScore = value.strand_scores?.[strandKey] || 0;
                    
                    return (
                      <div key={`${strand}_${index}`} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {typeof strand === 'string' ? strand : strand.name || `Strand ${index + 1}`}
                        </label>
                        <Select
                          value={currentScore.toString()}
                          onValueChange={(val) => handleStrandScoreChange(competency.id, strand, parseInt(val))}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Rate 1-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Not Assessed</SelectItem>
                            <SelectItem value="1">1 - Beginning</SelectItem>
                            <SelectItem value="2">2 - Developing</SelectItem>
                            <SelectItem value="3">3 - Proficient</SelectItem>
                            <SelectItem value="4">4 - Advanced</SelectItem>
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
            Teacher Remarks & Feedback
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
            Provide specific, constructive feedback to support the learner's development
          </div>
        </CardContent>
      </Card>

      {/* Competency Mastery Summary */}
      {value.overall_rating > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Learning Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-700 mb-2">Strengths Demonstrated</h5>
                <div className="space-y-1">
                  {Object.entries(value.strand_scores || {})
                    .filter(([_, score]) => score >= 3)
                    .map(([strand, score]) => (
                      <div key={strand} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{strand.split('_').pop()}: Level {score}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-orange-700 mb-2">Areas for Growth</h5>
                <div className="space-y-1">
                  {Object.entries(value.strand_scores || {})
                    .filter(([_, score]) => score < 3 && score > 0)
                    .map(([strand, score]) => (
                      <div key={strand} className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span>{strand.split('_').pop()}: Level {score}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
