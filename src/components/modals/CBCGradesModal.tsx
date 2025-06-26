
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CBCStrandGradingInterface } from '@/components/grading/CBCStrandGradingInterface';

interface CBCGradesModalProps {
  onClose: () => void;
}

export const CBCGradesModal: React.FC<CBCGradesModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [cbcGradeValue, setCbcGradeValue] = useState({
    performance_level: 'EM' as 'EM' | 'AP' | 'PR' | 'EX',
    strand_scores: {},
    teacher_remarks: '',
    assessment_type: ''
  });

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', user.school_id);
          
        if (error) throw error;
        setClasses(data || []);
      } catch (err: any) {
        console.error('Error loading classes:', err);
        setFormError('Failed to load classes. Please try again.');
      }
    };
    loadClasses();
  }, [user?.school_id]);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass || !user?.school_id) {
        setSubjects([]);
        return;
      }

      try {
        let query = supabase
          .from('subjects')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id);
        
        if (user.role === 'teacher') {
          query = query.eq('teacher_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        setSubjects(data || []);
      } catch (err: any) {
        console.error('Error loading subjects:', err);
        setFormError('Failed to load subjects. Please try again.');
      }
    };

    loadSubjects();
  }, [selectedClass, user?.school_id, user?.id, user?.role]);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !user?.school_id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id);

        if (error) throw error;

        setStudents(data || []);
      } catch (err: any) {
        console.error('Error loading students:', err);
        setFormError('Failed to load students. Please try again.');
      }
    };

    loadStudents();
  }, [selectedClass, user?.school_id]);

  const validateForm = () => {
    if (!selectedClass) {
      setFormError("Please select a class");
      return false;
    }
    if (!selectedSubject) {
      setFormError("Please select a subject");
      return false;
    }
    if (!selectedTerm) {
      setFormError("Please select a term");
      return false;
    }
    if (!selectedExamType) {
      setFormError("Please select an exam type");
      return false;
    }
    if (!selectedStudent) {
      setFormError("Please select a student");
      return false;
    }
    if (!cbcGradeValue.assessment_type) {
      setFormError("Please select an assessment type");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setFormError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Save CBC strand assessments
      const strandAssessments = Object.entries(cbcGradeValue.strand_scores).map(([strandName, performanceLevel]) => ({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_id: selectedClass,
        strand_name: strandName,
        performance_level: performanceLevel,
        assessment_type: cbcGradeValue.assessment_type,
        term: selectedTerm,
        teacher_remarks: cbcGradeValue.teacher_remarks,
        academic_year: new Date().getFullYear().toString()
      }));

      if (strandAssessments.length > 0) {
        const { error: strandError } = await supabase
          .from('cbc_strand_assessments')
          .upsert(strandAssessments);

        if (strandError) throw strandError;
      }

      // Save overall CBC grade
      const { error: gradeError } = await supabase
        .from('grades')
        .upsert({
          student_id: selectedStudent,
          subject_id: selectedSubject,
          class_id: selectedClass,
          term: selectedTerm,
          exam_type: selectedExamType,
          curriculum_type: 'cbc',
          cbc_performance_level: cbcGradeValue.performance_level,
          strand_scores: cbcGradeValue.strand_scores,
          comments: cbcGradeValue.teacher_remarks,
          status: user?.role === 'teacher' ? 'submitted' : 'draft',
          submitted_by: user?.id
        });

      if (gradeError) throw gradeError;

      toast({
        title: "Success",
        description: "CBC assessment submitted successfully.",
      });

      onClose();
    } catch (error: any) {
      console.error("Error submitting CBC assessment:", error);
      setFormError(error.message || "Failed to submit CBC assessment. Please try again.");
      
      toast({
        title: "Error",
        description: error.message || "Failed to submit CBC assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">🎓</span>
            CBC Assessment Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
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

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
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

            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type</Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="written_work">Written Work</SelectItem>
                  <SelectItem value="project_work">Project Work</SelectItem>
                  <SelectItem value="group_activity">Group Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} {student.admission_number && `(${student.admission_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CBC Grading Interface */}
          {selectedStudent && selectedSubject && selectedClass && selectedTerm && selectedExamType && (
            <CBCStrandGradingInterface
              studentId={selectedStudent}
              subjectId={selectedSubject}
              classId={selectedClass}
              term={selectedTerm}
              examType={selectedExamType}
              value={cbcGradeValue}
              onChange={setCbcGradeValue}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit CBC Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
