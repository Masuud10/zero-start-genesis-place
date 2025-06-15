
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import IGCSEGradesForm from './IGCSEGradesForm';
import IGCSEGradeActionButtons from './IGCSEGradeActionButtons';

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

  useEffect(() => {
    if (!user?.school_id) return;
    supabase
      .from('classes')
      .select('*')
      .eq('school_id', user.school_id)
      .then(({ data }) => setClasses(data || []));
  }, [user?.school_id]);

  useEffect(() => {
    if (!selectedClass || !user?.school_id) return;
    supabase
      .from('subjects')
      .select('*')
      .eq('class_id', selectedClass)
      .eq('school_id', user.school_id)
      .then(({ data }) => setSubjects(data || []));
  }, [selectedClass, user?.school_id]);

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

    if (!user?.school_id) {
        toast({
            title: "Error",
            description: "Your school is not identified. Cannot submit grade.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    try {
      // ⚠️ 'term' is a required field for grades
      // For now, default to "Term 1"
      const { error } = await supabase.from('grades').insert({
        school_id: user.school_id,
        student_id: selectedStudent,
        class_id: selectedClass,
        subject_id: subjectToInsert,
        score: null, // No numeric score for IGCSE
        comments: `IGCSE Grade: ${gradeToInsert}${useCustomSubject ? ` (${freeformSubject})` : ""}`,
        submitted_by: user?.id,
        status: 'submitted',
        term: 'Term 1', // This should probably be more dynamic in a real app
        max_score: 0, // Assuming 0 as there is no numeric score
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
        <IGCSEGradesForm
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          useCustomSubject={useCustomSubject}
          setUseCustomSubject={setUseCustomSubject}
          freeformSubject={freeformSubject}
          setFreeformSubject={setFreeformSubject}
          students={students}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          gradeChoice={gradeChoice}
          setGradeChoice={setGradeChoice}
          customGrade={customGrade}
          setCustomGrade={setCustomGrade}
          IGCSE_LETTER_GRADES={IGCSE_LETTER_GRADES}
        />
        <DialogFooter>
          <IGCSEGradeActionButtons
            loading={loading}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IGCSEGradesModal;
