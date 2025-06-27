
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Save, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useSchoolCurriculum } from '@/hooks/useSchoolCurriculum';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PrincipalBulkGradingInterface: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { curriculumType } = useSchoolCurriculum();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        
        // Initialize grades array for students
        const initialGrades = data?.map((student: any) => ({
          student_id: student.id,
          student_name: student.name,
          admission_number: student.admission_number,
          score: '',
          cbc_level: '',
          comments: ''
        })) || [];
        
        setGrades(initialGrades);
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

  const updateGrade = (studentId: string, field: string, value: string) => {
    setGrades(prev => prev.map(grade => 
      grade.student_id === studentId 
        ? { ...grade, [field]: value }
        : grade
    ));
  };

  const handleBulkSave = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType || !user?.id || !schoolId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const validGrades = grades.filter(grade => 
      isCBC ? grade.cbc_level : (grade.score && !isNaN(parseFloat(grade.score)))
    );

    if (validGrades.length === 0) {
      toast({
        title: "No Valid Grades",
        description: "Please enter at least one valid grade.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const gradeData = validGrades.map(grade => ({
        student_id: grade.student_id,
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
        comments: grade.comments || null,
        ...(isCBC
          ? { 
              cbc_performance_level: grade.cbc_level,
              score: null,
              max_score: null,
              percentage: null
            }
          : { 
              score: parseFloat(grade.score),
              max_score: 100,
              percentage: (parseFloat(grade.score) / 100) * 100,
              cbc_performance_level: null
            }
        )
      }));

      const { error } = await supabase
        .from('grades')
        .upsert(gradeData, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Grades Saved",
        description: `${validGrades.length} grades saved successfully using ${curriculumType?.toUpperCase() || 'STANDARD'} curriculum.`,
      });

      // Reset grades
      const resetGrades = grades.map(grade => ({
        ...grade,
        score: '',
        cbc_level: '',
        comments: ''
      }));
      setGrades(resetGrades);

    } catch (error: any) {
      console.error('Bulk grade save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save grades.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cbcLevels = [
    { value: 'exceeding_expectations', label: 'EE' },
    { value: 'meeting_expectations', label: 'ME' },
    { value: 'approaching_expectations', label: 'AE' },
    { value: 'below_expectations', label: 'BE' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Grade Entry
            <Badge className={isCBC ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {isCBC ? 'CBC' : 'Standard'} Curriculum
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Grades for {students.length} Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No.</TableHead>
                    {isCBC ? (
                      <TableHead>Performance Level</TableHead>
                    ) : (
                      <TableHead>Score (/100)</TableHead>
                    )}
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.student_id}>
                      <TableCell className="font-medium">{grade.student_name}</TableCell>
                      <TableCell>{grade.admission_number}</TableCell>
                      <TableCell>
                        {isCBC ? (
                          <Select 
                            value={grade.cbc_level} 
                            onValueChange={(value) => updateGrade(grade.student_id, 'cbc_level', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {cbcLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={grade.score}
                            onChange={(e) => updateGrade(grade.student_id, 'score', e.target.value)}
                            placeholder="0-100"
                            min="0"
                            max="100"
                            className="w-20"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={grade.comments}
                          onChange={(e) => updateGrade(grade.student_id, 'comments', e.target.value)}
                          placeholder="Optional comments"
                          className="w-40"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleBulkSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Grades
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrincipalBulkGradingInterface;
