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
        <div className="grid gap-4 py-4">
          {/* Class Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">Class</Label>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger id="class" className="col-span-3">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Subject Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Select onValueChange={setSelectedSubject} disabled={!selectedClass}>
              <SelectTrigger id="subject" className="col-span-3">
                <SelectValue placeholder="Select Subject" />
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
          {/* Student Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student" className="text-right">Student</Label>
            <Select onValueChange={setSelectedStudent} disabled={!selectedClass}>
              <SelectTrigger id="student" className="col-span-3">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Term Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">Term</Label>
            <Select onValueChange={setSelectedTerm}>
              <SelectTrigger id="term" className="col-span-3">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Exam Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="examType" className="text-right">Exam Type</Label>
            <Select onValueChange={setSelectedExamType}>
              <SelectTrigger id="examType" className="col-span-3">
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opener">Opener</SelectItem>
                <SelectItem value="mid_term">Mid Term</SelectItem>
                <SelectItem value="end_term">End Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Score */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">Score</Label>
            <Input
              type="number"
              id="score"
              className="col-span-3"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              max={maxScore}
              disabled={!canInput}
            />
          </div>
          {/* Max Score */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxScore" className="text-right">Max Score</Label>
            <Input
              type="number"
              id="maxScore"
              className="col-span-3"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              disabled={!canInput}
            />
          </div>
          {/* Principal Override Notice */}
          {isPrincipal && canOverride && (
            <div className="mt-2 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
              <b>Override Mode:</b> You can update or override any grade here for quality assurance.
            </div>
          )}
        </div>
        {/* Modal Action Buttons */}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {(canInput || canSubmit || canApprove) && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || (!canInput && !canApprove && !canSubmit)}
            >
              {loading
                ? 'Submitting...'
                : (isTeacher && canSubmit ? 'Submit for Approval'
                  : isPrincipal && canOverride ? 'Add/Update Grade'
                  : isPrincipal && canApprove ? 'Approve'
                  : isPrincipal && canInput ? 'Submit'
                  : 'Submit')}
            </Button>
          )}
          {isPrincipal && canRelease && (
            <Button
              type="button"
              variant="default"
              className="ml-2"
              onClick={() => toast({
                title: "Release Results",
                description: "Release logic would go here.",
                // Implement release logic or hook as needed
              })}
            >
              Release Results
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
