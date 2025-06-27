
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useSchoolCurriculum } from '@/hooks/useSchoolCurriculum';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  GraduationCap, 
  Save, 
  Plus, 
  Users, 
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

interface GradeEntry {
  studentId: string;
  score: string;
  comments: string;
  cbcLevel?: string;
}

const PrincipalGradeInputInterface: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { curriculumType } = useSchoolCurriculum();
  const { toast } = useToast();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('100');
  const [gradeEntries, setGradeEntries] = useState<Record<string, GradeEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCBC = curriculumType === 'cbc';
  const cbcLevels = ['EX', 'PR', 'AP', 'EM'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const examTypes = ['CAT 1', 'CAT 2', 'Mid Term', 'End Term', 'Final Exam'];

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",  
        description: "Failed to load subjects",
        variant: "destructive"
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('school_id', schoolId)
        .eq('class_id', selectedClass)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
      
      // Initialize grade entries for all students
      const initialEntries: Record<string, GradeEntry> = {};
      data?.forEach(student => {
        initialEntries[student.id] = {
          studentId: student.id,
          score: '',
          comments: '',
          cbcLevel: isCBC ? 'AP' : undefined
        };
      });
      setGradeEntries(initialEntries);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students", 
        variant: "destructive"
      });
    }
  };

  const updateGradeEntry = (studentId: string, field: keyof GradeEntry, value: string) => {
    setGradeEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType) {
      toast({
        title: "Error",
        description: "Please select class, subject, term, and exam type",
        variant: "destructive"
      });
      return;
    }

    // Validate entries
    const validEntries = Object.values(gradeEntries).filter(entry => 
      isCBC ? entry.cbcLevel : (entry.score && !isNaN(parseFloat(entry.score)))
    );

    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one grade",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const gradesToInsert = validEntries.map(entry => {
        const baseGrade = {
          student_id: entry.studentId,
          subject_id: selectedSubject,
          class_id: selectedClass,
          school_id: schoolId,
          term: selectedTerm,
          exam_type: selectedExamType,
          submitted_by: user?.id,
          submitted_at: new Date().toISOString(),
          status: 'approved', // Principal entries are pre-approved
          approved_by_principal: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          comments: entry.comments || null,
          curriculum_type: curriculumType
        };

        if (isCBC) {
          return {
            ...baseGrade,
            cbc_performance_level: entry.cbcLevel,
            performance_level: entry.cbcLevel,
            competency_level: entry.cbcLevel
          };
        } else {
          const score = parseFloat(entry.score);
          const maxScoreNum = parseFloat(maxScore) || 100;
          const percentage = (score / maxScoreNum) * 100;
          
          return {
            ...baseGrade,
            score: score,
            max_score: maxScoreNum,
            percentage: percentage,
            raw_score: score
          };
        }
      });

      const { error } = await supabase
        .from('grades')
        .insert(gradesToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${validEntries.length} grades saved successfully`,
      });

      // Reset form
      setGradeEntries(prev => {
        const reset: Record<string, GradeEntry> = {};
        Object.keys(prev).forEach(studentId => {
          reset[studentId] = {
            studentId,
            score: '',
            comments: '',
            cbcLevel: isCBC ? 'AP' : undefined
          };
        });
        return reset;
      });

    } catch (error: any) {
      console.error('Error saving grades:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save grades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getCBCBadgeColor = (level: string) => {
    switch (level) {
      case 'EX': return 'bg-green-100 text-green-800';
      case 'PR': return 'bg-blue-100 text-blue-800';
      case 'AP': return 'bg-yellow-100 text-yellow-800';
      case 'EM': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Principal Grade Input
            <Badge className={`ml-2 ${isCBC ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {isCBC ? 'CBC' : 'Standard'} Curriculum
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enter grades directly as a principal. These grades will be automatically approved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Exam Type</label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isCBC && (
            <div className="w-32">
              <label className="text-sm font-medium mb-2 block">Max Score</label>
              <Input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                min="1"
                max="1000"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Entry Table */}
      {students.length > 0 && selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Grade Entry Sheet
              <Badge variant="outline" className="ml-2">
                {students.length} Students
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    {isCBC ? (
                      <TableHead>Performance Level</TableHead>
                    ) : (
                      <TableHead>Score (/{maxScore})</TableHead>
                    )}
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell>
                        {isCBC ? (
                          <Select
                            value={gradeEntries[student.id]?.cbcLevel || 'AP'}
                            onValueChange={(value) => updateGradeEntry(student.id, 'cbcLevel', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cbcLevels.map(level => (
                                <SelectItem key={level} value={level}>
                                  <Badge className={getCBCBadgeColor(level)}>
                                    {level}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={gradeEntries[student.id]?.score || ''}
                            onChange={(e) => updateGradeEntry(student.id, 'score', e.target.value)}
                            min="0"
                            max={maxScore}
                            step="0.5"
                            className="w-20"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={gradeEntries[student.id]?.comments || ''}
                          onChange={(e) => updateGradeEntry(student.id, 'comments', e.target.value)}
                          placeholder="Optional comments"
                          rows={1}
                          className="min-h-[40px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={() => {
                  // Reset all entries
                  setGradeEntries(prev => {
                    const reset: Record<string, GradeEntry> = {};
                    Object.keys(prev).forEach(studentId => {
                      reset[studentId] = {
                        studentId,
                        score: '',
                        comments: '',
                        cbcLevel: isCBC ? 'AP' : undefined
                      };
                    });
                    return reset;
                  });
                }}
                variant="outline"
                disabled={saving}
              >
                Clear All
              </Button>
              <Button
                onClick={handleSaveGrades}
                disabled={saving || !selectedClass || !selectedSubject || !selectedTerm || !selectedExamType}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Grades
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {students.length === 0 && selectedClass && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No students found in selected class</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrincipalGradeInputInterface;
