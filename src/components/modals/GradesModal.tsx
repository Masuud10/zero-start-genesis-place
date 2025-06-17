
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
import CBCGradesForm from './CBCGradesForm';
import { useOptimizedGradeQuery, useGradeSubmissionMutation } from '@/hooks/useOptimizedGradeQuery';

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
  const [cbcLevel, setCbcLevel] = useState('');

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { toast } = useToast();
  const { currentSchool } = useSchool();

  const curriculumType = currentSchool?.curriculum_type || 'cbc';
  const resolvedUserRole = getValidUserRole(user?.role);
  const permissions = getGradingPermissions(resolvedUserRole);

  const gradeSubmissionMutation = useGradeSubmissionMutation();

  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', user.school_id);
          
        if (error) {
          console.error('Error loading classes:', error);
          setFormError(`Failed to load classes: ${error.message}`);
          return;
        }
        
        setClasses(data || []);
      } catch (err: any) {
        console.error('Error loading classes:', err);
        setFormError('Failed to load classes. Please try again.');
      }
    };
    loadClasses();
  }, [user?.school_id]);

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

        if (error) {
          console.error('Error loading subjects:', error);
          setFormError(`Failed to load subjects: ${error.message}`);
          return;
        }

        setSubjects(data || []);
        if (data?.length === 0 && user.role === 'teacher') {
          setFormError("You are not assigned to any subjects for this class.");
        } else {
          setFormError(null);
        }
      } catch (err: any) {
        console.error('Error loading subjects:', err);
        setFormError('Failed to load subjects. Please try again.');
      }
    };

    loadSubjects();
  }, [selectedClass, user?.school_id, user?.id, user?.role]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !user?.school_id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id);

        if (error) {
          console.error('Error loading students:', error);
          setFormError(`Failed to load students: ${error.message}`);
          return;
        }

        setStudents(data || []);
      } catch (err: any) {
        console.error('Error loading students:', err);
        setFormError('Failed to load students. Please try again.');
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
    setCbcLevel('');
    setFormError(null);
  };

  const validateForm = () => {
    const isCBC = curriculumType === 'cbc';
    
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
    if (isCBC && !cbcLevel) {
      setFormError("Please select a CBC performance level");
      return false;
    }
    if (!isCBC && !score) {
      setFormError("Please enter a score");
      return false;
    }
    if (!isCBC && (!maxScore || parseFloat(maxScore) <= 0)) {
      setFormError("Please enter a valid maximum score");
      return false;
    }
    if (!isCBC && parseFloat(score) > parseFloat(maxScore)) {
      setFormError("Score cannot be greater than maximum score");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setFormError(null);
    
    if (!validateForm()) {
      return;
    }

    // Check permissions
    if (!(permissions.canCreateGrades || permissions.canEditGrades)) {
      setFormError("You don't have permission to create or edit grades.");
      return;
    }

    setLoading(true);

    try {
      const isCBC = curriculumType === 'cbc';
      
      const gradeData = {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_id: selectedClass,
        term: selectedTerm,
        exam_type: selectedExamType,
        status: resolvedUserRole === "teacher" ? 'submitted' : status,
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
              percentage: (parseFloat(score) / parseFloat(maxScore)) * 100 
            }
        )
      };

      await gradeSubmissionMutation(gradeData);

      toast({
        title: "Success",
        description: "Grade submitted successfully.",
      });

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error submitting grade:", error);
      setFormError(error.message || "Failed to submit grade. Please try again.");
      
      toast({
        title: "Error",
        description: error.message || "Failed to submit grade. Please try again.",
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
        
        {formError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {curriculumType === 'cbc' ? (
          <CBCGradesForm
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
            cbcLevel={cbcLevel}
            setCbcLevel={setCbcLevel}
            canInput={canInput}
          />
        ) : (
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
        )}
        
        {isPrincipal && (
          <div className="grid grid-cols-4 items-center gap-4 py-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(value) => setStatus(value as 'draft' | 'submitted' | 'approved' | 'rejected' | 'released')}
              value={status}
            >
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Set Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                {canRelease && <SelectItem value="released">Released</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )}
        
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
