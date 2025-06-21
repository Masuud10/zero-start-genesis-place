
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Calculator, TrendingUp, Award, FileText, AlertTriangle } from 'lucide-react';

interface IGCSEGradeBoundaries {
  'A*': number;
  'A': number;
  'B': number;
  'C': number;
  'D': number;
  'E': number;
  'F': number;
  'G': number;
  'U': number;
}

interface IGCSEGradeValue {
  coursework_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  letter_grade: string;
  predicted_grade?: string;
  teacher_remarks: string;
  coursework_components: Record<string, number>;
  exam_components: Record<string, number>;
}

interface IGCSEGradingInterfaceProps {
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  examType: string;
  value: IGCSEGradeValue;
  onChange: (value: IGCSEGradeValue) => void;
  isReadOnly?: boolean;
}

const IGCSE_GRADES = [
  { grade: 'A*', color: 'bg-purple-100 text-purple-800', description: 'Exceptional performance' },
  { grade: 'A', color: 'bg-green-100 text-green-800', description: 'Excellent performance' },
  { grade: 'B', color: 'bg-blue-100 text-blue-800', description: 'Very good performance' },
  { grade: 'C', color: 'bg-cyan-100 text-cyan-800', description: 'Good performance' },
  { grade: 'D', color: 'bg-yellow-100 text-yellow-800', description: 'Satisfactory performance' },
  { grade: 'E', color: 'bg-orange-100 text-orange-800', description: 'Acceptable performance' },
  { grade: 'F', color: 'bg-red-100 text-red-800', description: 'Below acceptable standard' },
  { grade: 'G', color: 'bg-red-100 text-red-800', description: 'Well below acceptable standard' },
  { grade: 'U', color: 'bg-gray-100 text-gray-800', description: 'Ungraded' }
];

const DEFAULT_GRADE_BOUNDARIES: IGCSEGradeBoundaries = {
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

export const IGCSEGradingInterface: React.FC<IGCSEGradingInterfaceProps> = ({
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
  const [gradingConfig, setGradingConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGradingConfiguration();
  }, [subjectId, schoolId]);

  const loadGradingConfiguration = async () => {
    if (!subjectId || !schoolId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grading_configurations')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('school_id', schoolId)
        .eq('curriculum_type', 'igcse')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setGradingConfig(data || {
        coursework_percentage: 40,
        exam_percentage: 60,
        grade_boundaries: DEFAULT_GRADE_BOUNDARIES
      });
    } catch (error) {
      console.error('Error loading IGCSE grading configuration:', error);
      // Use default configuration
      setGradingConfig({
        coursework_percentage: 40,
        exam_percentage: 60,
        grade_boundaries: DEFAULT_GRADE_BOUNDARIES
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (courseworkScore: number, examScore: number): number => {
    if (!gradingConfig) return 0;
    
    const courseworkWeight = gradingConfig.coursework_percentage / 100;
    const examWeight = gradingConfig.exam_percentage / 100;
    
    return (courseworkScore * courseworkWeight) + (examScore * examWeight);
  };

  const determineLetterGrade = (percentage: number): string => {
    const boundaries = gradingConfig?.grade_boundaries || DEFAULT_GRADE_BOUNDARIES;
    
    for (const [grade, threshold] of Object.entries(boundaries)) {
      if (percentage >= threshold) {
        return grade;
      }
    }
    return 'U';
  };

  const handleScoreChange = (field: 'coursework_score' | 'exam_score', scoreValue: string) => {
    if (isReadOnly) return;

    const score = parseFloat(scoreValue) || 0;
    const newValue = { ...value, [field]: score };
    
    // Recalculate total score and grade
    const totalScore = calculateTotalScore(newValue.coursework_score, newValue.exam_score);
    const letterGrade = determineLetterGrade(totalScore);
    
    onChange({
      ...newValue,
      total_score: totalScore,
      percentage: totalScore,
      letter_grade: letterGrade
    });
  };

  const handleRemarksChange = (remarks: string) => {
    if (isReadOnly) return;
    onChange({
      ...value,
      teacher_remarks: remarks
    });
  };

  const handlePredictedGradeChange = (predictedGrade: string) => {
    if (isReadOnly) return;
    onChange({
      ...value,
      predicted_grade: predictedGrade
    });
  };

  const getGradeInfo = (grade: string) => {
    return IGCSE_GRADES.find(g => g.grade === grade) || IGCSE_GRADES[8];
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
      {/* Grade Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Assessment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {gradingConfig?.coursework_percentage || 40}%
              </div>
              <div className="text-sm text-gray-600">Coursework</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {gradingConfig?.exam_percentage || 60}%
              </div>
              <div className="text-sm text-gray-600">Examination</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Score Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Coursework Score (0-100%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={value.coursework_score || ''}
                onChange={(e) => handleScoreChange('coursework_score', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter coursework score"
                className="text-center text-lg"
              />
              <div className="text-xs text-gray-500 text-center">
                Weighted: {((value.coursework_score || 0) * (gradingConfig?.coursework_percentage || 40) / 100).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Exam Score (0-100%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={value.exam_score || ''}
                onChange={(e) => handleScoreChange('exam_score', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter exam score"
                className="text-center text-lg"
              />
              <div className="text-xs text-gray-500 text-center">
                Weighted: {((value.exam_score || 0) * (gradingConfig?.exam_percentage || 60) / 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Coursework Progress</span>
                <span>{value.coursework_score || 0}%</span>
              </div>
              <Progress value={value.coursework_score || 0} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Exam Progress</span>
                <span>{value.exam_score || 0}%</span>
              </div>
              <Progress value={value.exam_score || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Final Grade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-3xl font-bold text-gray-700">
                  {value.total_score ? value.total_score.toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-gray-500">Total Score</div>
              </div>
              
              <div className="h-12 w-px bg-gray-300"></div>
              
              <div>
                <Badge className={`${getGradeInfo(value.letter_grade).color} text-lg px-4 py-2 font-bold`}>
                  {value.letter_grade || 'U'}
                </Badge>
                <div className="text-sm text-gray-500 mt-1">
                  {getGradeInfo(value.letter_grade).description}
                </div>
              </div>
            </div>

            {/* Grade Boundaries Reference */}
            <div className="text-left">
              <h5 className="font-medium text-gray-700 mb-2">Grade Boundaries</h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(gradingConfig?.grade_boundaries || DEFAULT_GRADE_BOUNDARIES)
                  .slice(0, 9)
                  .map(([grade, threshold]) => (
                    <div
                      key={grade}
                      className={`flex justify-between p-1 rounded ${
                        value.letter_grade === grade ? 'bg-blue-100 font-bold' : 'bg-gray-50'
                      }`}
                    >
                      <span>{grade}:</span>
                      <span>{threshold}%+</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Grade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Predicted Grade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Predicted Final Grade
            </label>
            <Select
              value={value.predicted_grade || ''}
              onValueChange={handlePredictedGradeChange}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select predicted grade" />
              </SelectTrigger>
              <SelectContent>
                {IGCSE_GRADES.map((gradeInfo) => (
                  <SelectItem key={gradeInfo.grade} value={gradeInfo.grade}>
                    <div className="flex items-center gap-2">
                      <Badge className={`${gradeInfo.color} text-xs`}>
                        {gradeInfo.grade}
                      </Badge>
                      <span className="text-sm">{gradeInfo.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              Based on current performance and expected improvement
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Remarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teacher Comments & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter detailed feedback on student's performance, strengths, areas for improvement, and recommendations..."
            value={value.teacher_remarks || ''}
            onChange={(e) => handleRemarksChange(e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className="w-full"
          />
          <div className="mt-2 text-sm text-gray-500">
            Provide specific guidance for IGCSE preparation and performance improvement
          </div>
        </CardContent>
      </Card>

      {/* Performance Warning */}
      {value.total_score > 0 && value.total_score < 40 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <h5 className="font-medium text-orange-800">Performance Alert</h5>
                <p className="text-sm text-orange-700">
                  Current performance indicates risk of not meeting IGCSE pass standards. 
                  Additional support and intervention may be required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
