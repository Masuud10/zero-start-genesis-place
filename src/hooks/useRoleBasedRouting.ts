
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

export const useRoleBasedRouting = () => {
  const { user, isLoading } = useAuth();

  const validateRole = (allowedRoles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role as UserRole);
  };

  const requiresSchoolAssignment = (role: UserRole): boolean => {
    // These roles must be assigned to a specific school
    const schoolRequiredRoles: UserRole[] = [
      'school_owner',
      'principal', 
      'teacher',
      'finance_officer'
    ];
    return schoolRequiredRoles.includes(role);
  };

  const hasSchoolAssignment = (): boolean => {
    return !!user?.school_id;
  };

  const canAccessRoute = (allowedRoles: UserRole[], requireSchool = false): boolean => {
    if (isLoading || !user) return false;
    
    // Check role validation
    if (!validateRole(allowedRoles)) return false;
    
    // Check school assignment if required
    if (requireSchool && !hasSchoolAssignment()) return false;
    
    return true;
  };

  const getRedirectPath = (): string => {
    if (!user) return '/';
    
    // Role-based default paths
    switch (user.role) {
      case 'edufam_admin':
        return '/dashboard';
      case 'school_owner':
      case 'principal':
        return user.school_id ? '/dashboard' : '/setup';
      case 'teacher':
        return user.school_id ? '/dashboard' : '/setup';
      case 'finance_officer':
        return user.school_id ? '/dashboard' : '/setup';
      case 'parent':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const isSystemAdmin = (): boolean => {
    return user?.role === 'edufam_admin';
  };

  const isSchoolAdmin = (): boolean => {
    return ['school_owner', 'principal'].includes(user?.role || '');
  };

  const isSchoolStaff = (): boolean => {
    return ['school_owner', 'principal', 'teacher', 'finance_officer'].includes(user?.role || '');
  };

  return {
    user,
    isLoading,
    validateRole,
    requiresSchoolAssignment,
    hasSchoolAssignment,
    canAccessRoute,
    getRedirectPath,
    isSystemAdmin,
    isSchoolAdmin,
    isSchoolStaff
  };
};
