import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import IGCSESubjectPicker from './IGCSESubjectPicker';
import IGCSEGradeSelector from './IGCSEGradeSelector';

interface IGCSEGradesModalProps {
  onClose: () => void;
  userRole: string;
}

const IGCSE_LETTER_GRADES = [
  'A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'
];

const IGCSEGradesModal = ({ onClose, userRole }: IGCSEGradesModalProps) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [gradeChoice, setGradeChoice] = useState('');
  const [customGrade, setCustomGrade] = useState('');
  const [freeformSubject, setFreeformSubject] = useState('');
  const [useCustomSubject, setUseCustomSubject] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { currentSchool } = useSchool();

  // Load classes for school
  useEffect(() => {
    if (!user?.school_id) return;
    supabase
      .from('classes')
      .select('*')
      .eq('school_id', user.school_id)
      .then(({ data }) => setClasses(data || []));
  }, [user?.school_id]);

  // Load IGCSE subjects for class & school
  useEffect(() => {
    if (!selectedClass || !user?.school_id) return;
    supabase
      .from('subjects')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('school_id', user.school_id)
      .then(({ data }) => setSubjects(data || []));
  }, [selectedClass, user?.school_id]);

  // Load students for class & school
  useEffect(() => {
    if (!selectedClass || !user?.school_id) return;
    supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('school_id', user.school_id)
      .then(({ data }) => setStudents(data || []));
  }, [selectedClass, user?.school_id]);

  const handleSubmit = async () => {
    if (
      !selectedClass ||
      (!selectedSubject && !freeformSubject) ||
      !selectedStudent ||
      (!gradeChoice && !customGrade)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const gradeToInsert = customGrade || gradeChoice;
    const subjectToInsert = useCustomSubject ? null : selectedSubject;

    try {
      // ⚠️ 'term' is a required field for grades
      // For now, default to "Term 1"
      const { error } = await supabase.from('grades').insert({
        student_id: selectedStudent,
        class_id: selectedClass,
        subject_id: subjectToInsert,
        score: null, // No numeric score for IGCSE
        comments: `IGCSE Grade: ${gradeToInsert}${useCustomSubject ? ` (${freeformSubject})` : ""}`,
        submitted_by: user?.id,
        status: 'submitted',
        term: 'Term 1',
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Success",
        description: "IGCSE grade submitted successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit IGCSE grade.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enter IGCSE Grade</DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <Alert variant="default" className="mb-3">
            <AlertTriangle className="h-4 w-4 mr-1 text-amber-500 inline" />
            <AlertDescription>
              <b>IGCSE Grading</b>: Enter letter grade or custom grade for selected subject.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 py-2">
            {/* Class select */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="igcse-class" className="text-right">Class</Label>
              <Select onValueChange={setSelectedClass}>
                <SelectTrigger id="igcse-class" className="col-span-3">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject select or free form, now composed in its own component */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="subject" className="text-right">Subject</Label>
              <IGCSESubjectPicker
                useCustomSubject={useCustomSubject}
                setUseCustomSubject={setUseCustomSubject}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                freeformSubject={freeformSubject}
                setFreeformSubject={setFreeformSubject}
                subjects={subjects}
                selectedClass={selectedClass}
              />
            </div>

            {/* Student select */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="student" className="text-right">Student</Label>
              <Select onValueChange={setSelectedStudent} disabled={!selectedClass}>
                <SelectTrigger id="student" className="col-span-3">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(stu => (
                    <SelectItem key={stu.id} value={stu.id}>{stu.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade selector, now composed in its own component */}
            <IGCSEGradeSelector
              gradeChoice={gradeChoice}
              setGradeChoice={setGradeChoice}
              customGrade={customGrade}
              setCustomGrade={setCustomGrade}
              IGCSE_LETTER_GRADES={IGCSE_LETTER_GRADES}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IGCSEGradesModal;
