
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Send, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GradeSubmissionWorkflowProps {
  grades: Record<string, Record<string, any>>;
  classId: string;
  term: string;
  examType: string;
  subjects: Array<{ id: string; name: string; max_score: number }>;
  students: Array<{ id: string; name: string }>;
  onSubmissionSuccess: () => void;
}

export const GradeSubmissionWorkflow: React.FC<GradeSubmissionWorkflowProps> = ({
  grades,
  classId,
  term,
  examType,
  subjects,
  students,
  onSubmissionSuccess
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getGradeStats = () => {
    const totalPossible = students.length * subjects.length;
    let gradesFilled = 0;

    students.forEach(student => {
      subjects.forEach(subject => {
        if (grades[student.id]?.[subject.id]?.score !== null && 
            grades[student.id]?.[subject.id]?.score !== undefined) {
          gradesFilled++;
        }
      });
    });

    return { totalPossible, gradesFilled };
  };

  const validateGrades = () => {
    const errors: string[] = [];
    let validGradeCount = 0;

    Object.entries(grades).forEach(([studentId, studentGrades]) => {
      Object.entries(studentGrades).forEach(([subjectId, grade]) => {
        if (grade.score !== null && grade.score !== undefined) {
          const subject = subjects.find(s => s.id === subjectId);
          if (subject && grade.score > subject.max_score) {
            errors.push(`Score ${grade.score} exceeds maximum ${subject.max_score} for ${subject.name}`);
          }
          if (grade.score < 0) {
            errors.push(`Score cannot be negative for ${subject.name}`);
          }
          validGradeCount++;
        }
      });
    });

    return { errors, validGradeCount };
  };

  const saveAsDraft = async () => {
    if (!user?.id || !schoolId) return;

    setSaving(true);
    try {
      const { errors, validGradeCount } = validateGrades();
      
      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      if (validGradeCount === 0) {
        toast({
          title: "No Grades to Save",
          description: "Please enter at least one grade before saving",
          variant: "default"
        });
        return;
      }

      const gradesToSave: any[] = [];
      
      Object.entries(grades).forEach(([studentId, studentGrades]) => {
        Object.entries(studentGrades).forEach(([subjectId, grade]) => {
          if (grade.score !== null && grade.score !== undefined) {
            const subject = subjects.find(s => s.id === subjectId);
            const percentage = subject ? (grade.score / subject.max_score) * 100 : null;

            gradesToSave.push({
              student_id: studentId,
              subject_id: subjectId,
              class_id: classId,
              term,
              exam_type: examType.toUpperCase(), // Ensure uppercase format
              score: Number(grade.score),
              max_score: subject?.max_score || 100,
              percentage: percentage,
              comments: grade.comments || null,
              submitted_by: user.id,
              school_id: schoolId,
              status: 'draft',
              submitted_at: new Date().toISOString()
            });
          }
        });
      });

      console.log('Saving grades as draft:', gradesToSave);

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error saving grades:', error);
        throw error;
      }

      toast({
        title: "Grades Saved",
        description: `${validGradeCount} grades saved as draft`,
      });

    } catch (error: any) {
      console.error('Error saving grades:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save grades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (!user?.id || !schoolId) return;

    setSubmitting(true);
    try {
      const { errors, validGradeCount } = validateGrades();
      
      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      if (validGradeCount === 0) {
        toast({
          title: "No Grades to Submit",
          description: "Please enter at least one grade before submitting",
          variant: "destructive"
        });
        return;
      }

      const gradesToSubmit: any[] = [];
      
      Object.entries(grades).forEach(([studentId, studentGrades]) => {
        Object.entries(studentGrades).forEach(([subjectId, grade]) => {
          if (grade.score !== null && grade.score !== undefined) {
            const subject = subjects.find(s => s.id === subjectId);
            const percentage = subject ? (grade.score / subject.max_score) * 100 : null;

            gradesToSubmit.push({
              student_id: studentId,
              subject_id: subjectId,
              class_id: classId,
              term,
              exam_type: examType.toUpperCase(), // Ensure uppercase format
              score: Number(grade.score),
              max_score: subject?.max_score || 100,
              percentage: percentage,
              comments: grade.comments || null,
              submitted_by: user.id,
              school_id: schoolId,
              status: 'submitted',
              approval_workflow_stage: 'submitted',
              submitted_at: new Date().toISOString()
            });
          }
        });
      });

      console.log('Submitting grades for approval:', gradesToSubmit);

      // Update grades to submitted status
      const { error: submitError } = await supabase
        .from('grades')
        .upsert(gradesToSubmit, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (submitError) {
        console.error('Error submitting grades:', submitError);
        throw submitError;
      }

      // Create submission batch for tracking
      const batchData = {
        class_id: classId,
        term,
        exam_type: examType.toUpperCase(),
        school_id: schoolId,
        submitted_by: user.id,
        batch_name: `${term} - ${examType} - ${new Date().toLocaleDateString()}`,
        curriculum_type: 'standard',
        academic_year: new Date().getFullYear().toString(),
        total_students: students.length,
        grades_entered: validGradeCount,
        status: 'submitted'
      };

      const { error: batchError } = await supabase
        .from('grade_submission_batches')
        .upsert(batchData, {
          onConflict: 'school_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (batchError) {
        console.warn('Failed to create submission batch:', batchError);
      }

      toast({
        title: "Grades Submitted Successfully",
        description: `${validGradeCount} grades submitted for principal approval`,
      });

      onSubmissionSuccess();

    } catch (error: any) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit grades for approval",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const { totalPossible, gradesFilled } = getGradeStats();
  const completionPercentage = totalPossible > 0 ? Math.round((gradesFilled / totalPossible) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <span>
              <strong>Progress:</strong> {gradesFilled} of {totalPossible} grades entered ({completionPercentage}%)
            </span>
            <Badge variant="outline" className="bg-white">
              {completionPercentage}% Complete
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
        <div className="text-sm text-gray-600">
          {gradesFilled > 0 ? (
            <span className="text-green-700 font-medium">
              ✓ {gradesFilled} grades ready for submission
            </span>
          ) : (
            <span>No grades entered yet</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={saveAsDraft} 
            disabled={saving || gradesFilled === 0}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          
          <Button 
            onClick={submitForApproval} 
            disabled={submitting || gradesFilled === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit for Principal Approval
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Submission Guidelines */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Before submitting:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Review all grades for accuracy</li>
            <li>Ensure all scores are within the maximum allowed values</li>
            <li>Add comments where necessary</li>
            <li>Save as draft to preserve your work before final submission</li>
            <li>Once submitted, grades will require principal approval to modify</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
