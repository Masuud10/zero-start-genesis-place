
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface CBCAssessmentFormProps {
  classId: string;
  subjectId: string;
  term: string;
  students: Student[];
  onSave: () => void;
}

const performanceLevels = [
  { value: 'EMERGING', label: 'Emerging', color: 'bg-red-100 text-red-800', description: 'Beginning to develop skill' },
  { value: 'APPROACHING', label: 'Approaching', color: 'bg-yellow-100 text-yellow-800', description: 'Getting closer to mastery' },
  { value: 'PROFICIENT', label: 'Proficient', color: 'bg-blue-100 text-blue-800', description: 'Adequately demonstrates skill' },
  { value: 'EXCEEDING', label: 'Exceeding', color: 'bg-green-100 text-green-800', description: 'Goes beyond expected competency' }
];

const assessmentTypes = [
  { value: 'formative', label: 'Formative Assessment' },
  { value: 'summative', label: 'Summative Assessment' },
  { value: 'project', label: 'Project-Based Assessment' },
  { value: 'observation', label: 'Teacher Observation' }
];

const CBCAssessmentForm: React.FC<CBCAssessmentFormProps> = ({
  classId,
  subjectId,
  term,
  students,
  onSave
}) => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [assessments, setAssessments] = useState<Record<string, {
    performanceLevel: string;
    evidenceDescription: string;
    teacherObservation: string;
  }>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetencies();
  }, [subjectId]);

  const fetchCompetencies = async () => {
    try {
      // Fetch both core competencies and subject-specific ones
      const { data: coreCompetencies } = await supabase
        .from('competencies')
        .select('*')
        .eq('category', 'core');

      const { data: subjectCompetencies } = await supabase
        .from('subject_competencies')
        .select('competencies(*)')
        .eq('subject_id', subjectId);

      const allCompetencies = [
        ...(coreCompetencies || []),
        ...(subjectCompetencies?.map(sc => sc.competencies).filter(Boolean) || [])
      ];

      setCompetencies(allCompetencies);
    } catch (error) {
      console.error('Error fetching competencies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch competencies",
        variant: "destructive",
      });
    }
  };

  const handleAssessmentChange = (studentId: string, field: string, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveAssessments = async () => {
    if (!selectedCompetency || !assessmentType) {
      toast({
        title: "Missing Information",
        description: "Please select competency and assessment type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const assessmentData = Object.entries(assessments)
        .filter(([_, assessment]) => assessment.performanceLevel)
        .map(([studentId, assessment]) => ({
          student_id: studentId,
          subject_id: subjectId,
          competency_id: selectedCompetency,
          class_id: classId,
          term,
          assessment_type: assessmentType,
          performance_level: assessment.performanceLevel,
          evidence_description: assessment.evidenceDescription,
          teacher_observation: assessment.teacherObservation,
          submitted_by: (await supabase.auth.getUser()).data.user?.id
        }));

      const { error } = await supabase
        .from('cbc_assessments')
        .insert(assessmentData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "CBC assessments saved successfully",
      });

      onSave();
      setAssessments({});
    } catch (error) {
      console.error('Error saving assessments:', error);
      toast({
        title: "Error",
        description: "Failed to save assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevelInfo = (level: string) => {
    return performanceLevels.find(pl => pl.value === level);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CBC Competency Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="competency">Select Competency</Label>
            <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
              <SelectTrigger>
                <SelectValue placeholder="Choose competency to assess" />
              </SelectTrigger>
              <SelectContent>
                {competencies.map((competency) => (
                  <SelectItem key={competency.id} value={competency.id}>
                    <div>
                      <div className="font-medium">{competency.name}</div>
                      <div className="text-xs text-muted-foreground">{competency.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="assessmentType">Assessment Type</Label>
            <Select value={assessmentType} onValueChange={setAssessmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose assessment type" />
              </SelectTrigger>
              <SelectContent>
                {assessmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCompetency && assessmentType && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-muted rounded-lg">
              {performanceLevels.map((level) => (
                <div key={level.value} className="text-center">
                  <Badge className={level.color}>{level.label}</Badge>
                  <p className="text-xs mt-1">{level.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Performance Level</Label>
                        <Select 
                          value={assessments[student.id]?.performanceLevel || ''} 
                          onValueChange={(value) => handleAssessmentChange(student.id, 'performanceLevel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {performanceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={level.color}>{level.label}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Evidence Description</Label>
                        <Textarea
                          placeholder="What did the learner demonstrate?"
                          value={assessments[student.id]?.evidenceDescription || ''}
                          onChange={(e) => handleAssessmentChange(student.id, 'evidenceDescription', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <Label>Teacher Observation</Label>
                        <Textarea
                          placeholder="Additional notes and observations"
                          value={assessments[student.id]?.teacherObservation || ''}
                          onChange={(e) => handleAssessmentChange(student.id, 'teacherObservation', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button onClick={handleSaveAssessments} disabled={loading}>
                {loading ? 'Saving...' : 'Save Assessments'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CBCAssessmentForm;
