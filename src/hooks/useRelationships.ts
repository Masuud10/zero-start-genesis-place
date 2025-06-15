
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ClassManagementService } from '@/services/classManagementService';

interface AssignTeacherParams { teacherId: string; classId: string; subjectId: string; }
interface UnassignTeacherParams { assignmentId: string; classId: string | null; }
interface EnrollStudentParams { studentId: string; classId: string; academicYear?: string }
interface LinkParentParams { parentId: string, studentId: string, relationshipType?: string, isPrimaryContact?: boolean }

export const useRelationships = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignTeacherMutation = useMutation({
    mutationFn: (params: AssignTeacherParams) => ClassManagementService.assignTeacherToClass(params),
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: "Teacher assigned to class successfully" });
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to assign teacher to class", variant: "destructive" });
    }
  });

  const unassignTeacherMutation = useMutation({
    mutationFn: (params: UnassignTeacherParams) => ClassManagementService.unassignTeacher(params.assignmentId),
    onSuccess: (_, variables) => {
      toast({ title: "Success", description: "Teacher unassigned successfully." });
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to unassign teacher.", variant: "destructive" });
    }
  });

  const enrollStudentMutation = useMutation({
    mutationFn: (params: EnrollStudentParams) => ClassManagementService.enrollStudent(params),
    onSuccess: () => {
      toast({ title: "Success", description: "Student enrolled in class successfully" });
      // Invalidate relevant queries here, e.g., student lists
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to enroll student in class", variant: "destructive" });
    }
  });

  const linkParentMutation = useMutation({
    mutationFn: (params: LinkParentParams) => ClassManagementService.linkParentToStudent(params),
    onSuccess: () => {
      toast({ title: "Success", description: "Parent linked to student successfully" });
      // Invalidate relevant queries here, e.g., parent lists
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to link parent to student", variant: "destructive" });
    }
  });

  return {
    assignTeacher: assignTeacherMutation.mutateAsync,
    unassignTeacher: unassignTeacherMutation.mutateAsync,
    enrollStudent: enrollStudentMutation.mutateAsync,
    linkParent: linkParentMutation.mutateAsync,
    loading: assignTeacherMutation.isPending || unassignTeacherMutation.isPending || enrollStudentMutation.isPending || linkParentMutation.isPending,
  };
};
