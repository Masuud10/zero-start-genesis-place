
import { UserRole } from '@/types/user';
import { Grade, BulkGradeSubmission } from '@/types/grading';

export interface GradingPermissions {
  canCreateGrades: boolean;
  canEditGrades: boolean;
  canSubmitGrades: boolean;
  canApproveGrades: boolean;
  canRejectGrades: boolean;
  canOverrideGrades: boolean;
  canReleaseResults: boolean;
  canViewDetailedGrades: boolean;
  canViewGradeSummaries: boolean;
  canEditAttendance: boolean;
  canViewAttendance: boolean;
}

export const getGradingPermissions = (role: UserRole): GradingPermissions => {
  switch (role) {
    case 'teacher':
      return {
        canCreateGrades: true,
        canEditGrades: true, // Only for draft/rejected grades
        canSubmitGrades: true,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: true, // Only for their classes
        canViewGradeSummaries: true,
        canEditAttendance: true,
        canViewAttendance: true,
      };

    case 'principal':
      return {
        canCreateGrades: false, // Principals review, don't create
        canEditGrades: true, // Can edit any grade
        canSubmitGrades: false,
        canApproveGrades: true,
        canRejectGrades: true,
        canOverrideGrades: true,
        canReleaseResults: true,
        canViewDetailedGrades: true,
        canViewGradeSummaries: true,
        canEditAttendance: true,
        canViewAttendance: true,
      };

    case 'school_owner':
      return {
        canCreateGrades: false,
        canEditGrades: false,
        canSubmitGrades: false,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: false,
        canViewGradeSummaries: true, // Only summaries
        canEditAttendance: false,
        canViewAttendance: true,
      };

    case 'finance_officer':
      return {
        canCreateGrades: false,
        canEditGrades: false,
        canSubmitGrades: false,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: false,
        canViewGradeSummaries: true,
        canEditAttendance: false,
        canViewAttendance: false,
      };

    case 'edufam_admin':
      return {
        canCreateGrades: false,
        canEditGrades: false,
        canSubmitGrades: false,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: false,
        canViewGradeSummaries: true,
        canEditAttendance: false,
        canViewAttendance: true,
      };

    case 'parent':
      return {
        canCreateGrades: false,
        canEditGrades: false,
        canSubmitGrades: false,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: true, // Only for their children, only released grades
        canViewGradeSummaries: true,
        canEditAttendance: false,
        canViewAttendance: true, // Only for their children
      };

    default:
      return {
        canCreateGrades: false,
        canEditGrades: false,
        canSubmitGrades: false,
        canApproveGrades: false,
        canRejectGrades: false,
        canOverrideGrades: false,
        canReleaseResults: false,
        canViewDetailedGrades: false,
        canViewGradeSummaries: false,
        canEditAttendance: false,
        canViewAttendance: false,
      };
  }
};

export const canEditGrade = (grade: Grade, userRole: UserRole, userId: string): boolean => {
  const permissions = getGradingPermissions(userRole);
  
  if (!permissions.canEditGrades) return false;
  
  // Teachers can only edit their own grades in draft or rejected status
  if (userRole === 'teacher') {
    return grade.submittedBy === userId && 
           (grade.status === 'draft' || grade.status === 'rejected');
  }
  
  // Principals can edit any grade except released ones
  if (userRole === 'principal') {
    return grade.status !== 'released';
  }
  
  return false;
};

export const canApproveGrade = (grade: Grade, userRole: UserRole): boolean => {
  const permissions = getGradingPermissions(userRole);
  return permissions.canApproveGrades && grade.status === 'pending_approval';
};

export const canReleaseResults = (submission: BulkGradeSubmission, userRole: UserRole): boolean => {
  const permissions = getGradingPermissions(userRole);
  return permissions.canReleaseResults && submission.status === 'approved';
};

export const getGradeStatusColor = (status: Grade['status']): string => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700';
    case 'pending_approval': return 'bg-blue-100 text-blue-700';
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    case 'released': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

