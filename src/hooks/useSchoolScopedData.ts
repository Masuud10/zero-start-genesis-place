import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';

export interface SchoolScopedDataResult {
  schoolId: string | null;
  isReady: boolean;
  isLoading: boolean;
  hasSchool: boolean;
  isMultiTenantUser: boolean;
  isSystemAdmin: boolean;
  userRole: string | undefined;
  validateSchoolAccess: (requiredSchoolId?: string) => boolean;
}

export const useSchoolScopedData = (): SchoolScopedDataResult => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentSchool, isLoading: schoolLoading } = useSchool();

  // System admins can access all schools
  const isMultiTenantUser = user?.role === 'edufam_admin' || user?.role === 'elimisha_admin';
  const isSystemAdmin = isMultiTenantUser; // Alias for backward compatibility
  
  // For multi-tenant users, use current selected school or null if none selected
  // For regular users, use their assigned school
  const schoolId = isMultiTenantUser 
    ? currentSchool?.id || null 
    : user?.school_id || null;

  const isLoading = authLoading || schoolLoading;
  const hasSchool = !!schoolId;
  const isReady = !isLoading && !!user;

  // Validation function for school access
  const validateSchoolAccess = (requiredSchoolId?: string): boolean => {
    // System admins can access all schools
    if (isSystemAdmin) {
      return true;
    }

    // If no school ID required, just check if user has a school
    if (!requiredSchoolId) {
      return hasSchool;
    }

    // Check if user's school matches required school
    return schoolId === requiredSchoolId;
  };

  console.log('🏫 useSchoolScopedData:', {
    userRole: user?.role,
    schoolId,
    isMultiTenantUser,
    isSystemAdmin,
    hasSchool,
    isReady,
    isLoading
  });

  return {
    schoolId,
    isReady,
    isLoading,
    hasSchool,
    isMultiTenantUser,
    isSystemAdmin,
    userRole: user?.role,
    validateSchoolAccess
  };
};