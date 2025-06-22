
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkGradingSubmissionHandlerProps {
  schoolId: string;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  userId?: string;
  isTeacher: boolean;
  onClose: () => void;
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  isAbsent?: boolean;
};

export const useBulkGradingSubmissionHandler = ({
  schoolId,
  selectedClass,
  selectedTerm,
  selectedExamType,
  userId,
  isTeacher,
  onClose
}: BulkGradingSubmissionHandlerProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (grades: Record<string, Record<string, GradeValue>>) => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId || !userId) {
      toast({ 
        title: "Missing Information", 
        description: "Please ensure all required fields are filled and you are authenticated.", 
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const gradesToUpsert = [];
      let validGradeCount = 0;
      
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          
          // Submit grades that have valid scores or are marked as absent
          if ((grade.score !== undefined && grade.score !== null && grade.score >= 0) || grade.isAbsent) {
            const maxScore = 100; // Default max score
            const percentage = grade.isAbsent ? null : 
              (grade.percentage || (grade.score !== null ? (Number(grade.score) / maxScore) * 100 : null));

            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType.toUpperCase(), // Ensure uppercase format
              score: grade.isAbsent ? null : Number(grade.score),
              max_score: maxScore,
              percentage: percentage,
              letter_grade: grade.isAbsent ? null : grade.letter_grade,
              cbc_performance_level: grade.cbc_performance_level || null,
              submitted_by: userId,
              status: isTeacher ? 'submitted' : 'approved',
              submitted_at: new Date().toISOString(),
              comments: grade.isAbsent ? 'Student was absent' : null,
            });
            validGradeCount++;
          }
        }
      }
      
      if (gradesToUpsert.length === 0) {
        toast({ 
          title: "No Grades to Submit", 
          description: "Please enter at least one grade or mark students as absent.", 
          variant: "default"
        });
        return;
      }

      console.log('Submitting grades:', gradesToUpsert.length, 'records');

      // Use upsert to handle duplicate entries with proper onConflict specification
      const { error } = await supabase
        .from('grades')
        .upsert(gradesToUpsert, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Grade submission error:', error);
        throw new Error(`Failed to submit grades: ${error.message}`);
      }

      // Create submission batch for tracking
      if (isTeacher) {
        const batchData = {
          class_id: selectedClass,
          term: selectedTerm,
          exam_type: selectedExamType.toUpperCase(),
          school_id: schoolId,
          submitted_by: userId,
          batch_name: `${selectedTerm} - ${selectedExamType} - ${new Date().toLocaleDateString()}`,
          curriculum_type: 'standard',
          academic_year: new Date().getFullYear().toString(),
          total_students: Object.keys(grades).length,
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
          // Don't fail the entire submission for batch creation errors
        }
      }

      // Calculate positions after successful submission
      if (selectedClass && selectedTerm && selectedExamType) {
        try {
          await supabase.rpc('calculate_class_positions', {
            p_class_id: selectedClass,
            p_term: selectedTerm,
            p_exam_type: selectedExamType.toUpperCase()
          });
        } catch (positionError) {
          console.warn('Position calculation failed:', positionError);
          // Don't fail the entire submission for position calculation errors
        }
      }

      const statusMessage = isTeacher 
        ? 'submitted for principal approval' 
        : 'saved and approved successfully';

      toast({ 
        title: "Success", 
        description: `${validGradeCount} grades ${statusMessage}.`
      });
      
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting grades:', error);
      toast({ 
        title: "Submission Failed", 
        description: error.message || "Failed to submit grades. Please try again.", 
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { handleSubmit, submitting };
};
