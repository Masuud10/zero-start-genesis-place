
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useSchoolCurriculum } from '@/hooks/useSchoolCurriculum';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PrincipalGradeInputInterface: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { curriculumType } = useSchoolCurriculum();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  // Standard curriculum fields
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  
  // CBC curriculum fields
  const [cbcLevel, setCbcLevel] = useState('');
  
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const isCBC = curriculumType === 'cbc';

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name');
          
        if (error) throw error;
        setClasses(data || []);
      } catch (error: any) {
        console.error('Error loading classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive"
        });
      }
    };
    loadClasses();
  }, [schoolId, toast]);

  // Load subjects for selected class
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass || !schoolId) {
        setSubjects([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', schoolId)
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
      } catch (error: any) {
        console.error('Error loading subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects.",
          variant: "destructive"
        });
      }
    };
    loadSubjects();
  }, [selectedClass, schoolId, toast]);

  // Load students for selected class
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !schoolId) {
        setStudents([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', schoolId)
          .order('name');

        if (error) throw error;
        setStudents(data || []);
      } catch (error: any) {
        console.error('Error loading students:', error);
        toast({
          title: "Error",
          description: "Failed to load students.",
          variant: "destructive"
        });
      }
    };
    loadStudents();
  }, [selectedClass, schoolId, toast]);

  const validateForm = () => {
    if (!selectedClass || !selectedSubject || !selectedStudent || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    if (isCBC && !cbcLevel) {
      toast({
        title: "Missing CBC Level",
        description: "Please select a CBC performance level.",
        variant: "destructive"
      });
      return false;
    }

    if (!isCBC && (!score || !maxScore)) {
      toast({
        title: "Missing Score",
        description: "Please enter both score and maximum score.",
        variant: "destructive"
      });
      return false;
    }

    if (!isCBC && parseFloat(score) > parseFloat(maxScore)) {
      toast({
        title: "Invalid Score",
        description: "Score cannot be greater than maximum score.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.id || !schoolId) return;

    setLoading(true);
    try {
      const gradeData = {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_id: selectedClass,
        school_id: schoolId,
        term: selectedTerm,
        exam_type: selectedExamType.toUpperCase(),
        status: 'approved', // Principal entries are auto-approved
        submitted_by: user.id,
        approved_by: user.id,
        approved_by_principal: true,
        submitted_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        curriculum_type: curriculumType || 'standard',
        comments: comments || null,
        ...(isCBC
          ? { 
              cbc_performance_level: cbcLevel,
              score: null,
              max_score: null,
              percentage: null
            }
          : { 
              score: parseFloat(score),
              max_score: parseFloat(maxScore),
              percentage: (parseFloat(score) / parseFloat(maxScore)) * 100,
              cbc_performance_level: null
            }
        )
      };

      const { error } = await supabase
        .from('grades')
        .upsert(gradeData, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Grade Saved",
        description: `Grade has been successfully saved and approved using ${curriculumType?.toUpperCase() || 'STANDARD'} curriculum.`,
      });

      // Reset form
      setSelectedStudent('');
      setScore('');
      setMaxScore('100');
      setCbcLevel('');
      setComments('');

    } catch (error: any) {
      console.error('Grade submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save grade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cbcLevels = [
    { value: 'exceeding_expectations', label: 'Exceeding Expectations (EE)' },
    { value: 'meeting_expectations', label: 'Meeting Expectations (ME)' },
    { value: 'approaching_expectations', label: 'Approaching Expectations (AE)' },
    { value: 'below_expectations', label: 'Below Expectations (BE)' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Principal Grade Input
            <Badge className={isCBC ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {isCBC ? 'CBC' : 'Standard'} Curriculum
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `(${cls.stream})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="student">Student *</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term *</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="examType">Exam Type *</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAT">CAT</SelectItem>
                  <SelectItem value="MID_TERM">Mid Term</SelectItem>
                  <SelectItem value="END_TERM">End Term</SelectItem>
                  <SelectItem value="MOCK">Mock Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCBC ? (
              <div>
                <Label htmlFor="cbcLevel">CBC Performance Level *</Label>
                <Select value={cbcLevel} onValueChange={setCbcLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select performance level" />
                  </SelectTrigger>
                  <SelectContent>
                    {cbcLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="score">Score *</Label>
                  <Input
                    id="score"
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score"
                    min="0"
                    max={maxScore}
                  />
                </div>
                <div>
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    placeholder="Enter maximum score"
                    min="1"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any additional comments about the student's performance..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Grade
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalGradeInputInterface;
