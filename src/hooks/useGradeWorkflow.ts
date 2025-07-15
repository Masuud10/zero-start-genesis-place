import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { GradeWorkflowService, GradeSubmissionPayload } from "@/services/gradeWorkflowService";

export const useGradeWorkflow = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  /**
   * Submit grades for approval (Teacher -> Principal)
   */
  const submitGradesForApproval = async (payload: GradeSubmissionPayload) => {
    if (!user?.id || user.role !== 'teacher') {
      throw new Error('Only teachers can submit grades for approval');
    }

    setSubmitting(true);
    try {
      await GradeWorkflowService.submitGradesForApproval(payload, user.id);
      
      toast({
        title: "Success",
        description: "Grades submitted for principal approval",
      });
    } catch (error) {
      console.error('Failed to submit grades:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to submit grades",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Fetch released grades for parent view
   */
  const fetchParentGrades = async (studentId: string) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    try {
      return await GradeWorkflowService.fetchReleasedGradesForParent(studentId, schoolId);
    } catch (error) {
      console.error('Failed to fetch parent grades:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student grades",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Fetch grade sheet for editing
   */
  const fetchGradeSheet = async (
    classId: string, 
    subjectId: string, 
    term: string, 
    examType: string
  ) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    try {
      return await GradeWorkflowService.fetchGradeSheet(
        schoolId, classId, subjectId, term, examType
      );
    } catch (error) {
      console.error('Failed to fetch grade sheet:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grade sheet",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    submitGradesForApproval,
    fetchParentGrades,
    fetchGradeSheet,
    submitting,
  };
};