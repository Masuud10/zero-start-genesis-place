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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';
import IGCSEGradesModal from './IGCSEGradesModal';
import { getGradingPermissions } from '@/utils/grading-permissions';
import { UserRole } from '@/types/user';
import GradesForm from './GradesForm';
import GradeActionButtons from './GradeActionButtons';

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GRADING_ROLES: UserRole[] = [
  'school_owner',
  'principal',
  'teacher',
  'parent',
  'finance_officer',
  'edufam_admin'
];

const getValidUserRole = (role: string | undefined): UserRole => {
  return (GRADING_ROLES.includes(role as UserRole) ? (role as UserRole) : 'teacher');
};

const GradesModal = ({ onClose, userRole }: GradesModalProps) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [status, setStatus] = useState<'draft'|'submitted'|'approved'|'rejected'|'released'>('draft');

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { currentSchool } = useSchool();

  const curriculumType = currentSchool?.curriculum_type || 'cbc';
  const resolvedUserRole = getValidUserRole(user?.role);
  const permissions = getGradingPermissions(resolvedUserRole);

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);
      if (!error && data) {
        setClasses(data);
      }
    };
    loadClasses();
  }, [user?.school_id]);

  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass || !user?.school_id) return;

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', user.school_id);

      if (!error && data) {
        setSubjects(data);
      }
    };

    loadSubjects();
  }, [selectedClass, user?.school_id]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !user?.school_id) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', user.school_id);

      if (!error && data) {
        setStudents(data);
      }
    };

    loadStudents();
  }, [selectedClass, user?.school_id]);

  const resetForm = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTerm('');
    setSelectedExamType('');
    setScore('');
    setMaxScore('100');
    setSelectedStudent('');
    setStatus('draft');
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedExamType || !selectedStudent || !score) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!currentSchool?.id) {
        toast({
          title: "Error",
          description: "School is not identified. Cannot submit grade.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Only allow create/edit if permissions are granted
      if (!(permissions.canCreateGrades || permissions.canEditGrades)) {
        toast({
          title: "No Permission",
          description: "You cannot create or edit grades.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const gradeData = {
        school_id: currentSchool.id,
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_id: selectedClass,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        percentage: (parseFloat(score) / parseFloat(maxScore)) * 100,
        term: selectedTerm,
        exam_type: selectedExamType,
        submitted_by: user?.id,
        status: resolvedUserRole === "teacher" ? 'submitted' : status, // teachers submit, principals may set
      };

      const { error } = await supabase
        .from('grades')
        .insert(gradeData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade submitted successfully.",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast({
        title: "Error",
        description: "Failed to submit grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = () => {
    toast({
      title: "Release Results",
      description: "Release logic would go here.",
    });
    // Implement release logic if needed
  };

  const isTeacher = resolvedUserRole === "teacher";
  const isPrincipal = resolvedUserRole === "principal";

  const canOverride = permissions.canOverrideGrades && isPrincipal;
  const canRelease = permissions.canReleaseResults && isPrincipal;
  const canApprove = permissions.canApproveGrades && isPrincipal;
  const canSubmit = isTeacher && permissions.canSubmitGrades;
  const canInput = isTeacher ? permissions.canCreateGrades : permissions.canEditGrades || permissions.canCreateGrades;

  // Modal switching: IGCSE custom flow
  if (curriculumType === 'igcse') {
    return <IGCSEGradesModal onClose={onClose} userRole={resolvedUserRole} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Enter Grades
            <span className="ml-2 inline-block align-middle">
              {isTeacher && permissions.canSubmitGrades && (
                <span className="text-xs text-blue-700 font-semibold">(Teacher: submit for approval)</span>
              )}
              {isPrincipal && (
                <span className="text-xs text-green-700 font-semibold ml-1">(Principal: {[
                  canApprove ? "approve, " : "",
                  canOverride ? "override, " : "",
                  canRelease ? "release, " : "",
                  "input marks"
                ].join('').replace(/, $/, '')})</span>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>
        <GradesForm
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          students={students}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          selectedExamType={selectedExamType}
          setSelectedExamType={setSelectedExamType}
          score={score}
          setScore={setScore}
          maxScore={maxScore}
          setMaxScore={setMaxScore}
          canInput={canInput}
          isPrincipal={isPrincipal}
          canOverride={canOverride}
        />
        <DialogFooter>
          {(isTeacher || isPrincipal) && (
            <GradeActionButtons
              onClose={onClose}
              onSubmit={handleSubmit}
              loading={loading}
              permissions={{ canInput, canSubmit, canApprove, canRelease, canOverride }}
              role={isTeacher ? 'teacher' : 'principal'}
              isPrincipal={isPrincipal}
              isTeacher={isTeacher}
              canRelease={canRelease}
              handleRelease={handleRelease}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
