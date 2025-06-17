
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
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) {
      toast({ 
        title: "Missing Information", 
        description: "Please select a class, term, and exam type.", 
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
          
          if (grade.score !== undefined && grade.score !== null && grade.score.toString() !== '') {
            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              score: Number(grade.score),
              max_score: 100, // Default max score
              percentage: grade.percentage,
              letter_grade: grade.letter_grade || null,
              cbc_performance_level: grade.cbc_performance_level || null,
              submitted_by: userId,
              status: isTeacher ? 'submitted' : 'draft',
              submitted_at: isTeacher ? new Date().toISOString() : null,
            });
            validGradeCount++;
          }
        }
      }
      
      if (gradesToUpsert.length === 0) {
        toast({ 
          title: "No Grades to Submit", 
          description: "Please enter at least one grade score.", 
          variant: "default"
        });
        return;
      }

      console.log('Submitting grades:', gradesToUpsert.length, 'records');

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToUpsert, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type',
        });

      if (error) throw error;

      // Calculate positions after successful submission
      if (selectedClass && selectedTerm && selectedExamType) {
        await supabase.rpc('calculate_class_positions', {
          p_class_id: selectedClass,
          p_term: selectedTerm,
          p_exam_type: selectedExamType
        });
      }

      const statusMessage = isTeacher 
        ? 'submitted for principal approval' 
        : 'saved successfully';

      toast({ 
        title: "Success", 
        description: `${validGradeCount} grades ${statusMessage}.`
      });
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting grades:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit grades.", 
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return { handleSubmit, submitting };
};
