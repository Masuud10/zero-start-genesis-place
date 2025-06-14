
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { RoleResolver } from '@/utils/roleResolver';

export const useRoleValidation = () => {
  const { user, isLoading } = useAuth();
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    hasValidRole: boolean;
    hasRequiredSchoolAssignment: boolean;
    redirectPath: string | null;
    error: string | null;
  }>({
    isValid: false,
    hasValidRole: false,
    hasRequiredSchoolAssignment: false,
    redirectPath: null,
    error: null
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setValidationStatus({
        isValid: false,
        hasValidRole: false,
        hasRequiredSchoolAssignment: false,
        redirectPath: '/',
        error: 'No user authenticated'
      });
      return;
    }

    console.log('🔍 useRoleValidation: Validating user role:', {
      email: user.email,
      role: user.role,
      schoolId: user.school_id
    });

    // Check if user has a valid role
    const hasValidRole = user.role && RoleResolver.isValidRole(user.role);
    
    if (!hasValidRole) {
      setValidationStatus({
        isValid: false,
        hasValidRole: false,
        hasRequiredSchoolAssignment: false,
        redirectPath: null,
        error: `Invalid role: ${user.role || 'None'}`
      });
      return;
    }

    const userRole = user.role as UserRole;
    const requiresSchool = RoleResolver.requiresSchoolAssignment(userRole);
    const hasSchoolAssignment = !!user.school_id;
    const hasRequiredSchoolAssignment = !requiresSchool || hasSchoolAssignment;

    const redirectPath = RoleResolver.getDefaultRedirectPath(userRole, hasSchoolAssignment);

    setValidationStatus({
      isValid: hasValidRole && hasRequiredSchoolAssignment,
      hasValidRole,
      hasRequiredSchoolAssignment,
      redirectPath,
      error: !hasRequiredSchoolAssignment 
        ? `Role ${userRole} requires school assignment` 
        : null
    });

    console.log('🔍 useRoleValidation: Validation complete:', {
      isValid: hasValidRole && hasRequiredSchoolAssignment,
      hasValidRole,
      hasRequiredSchoolAssignment,
      redirectPath
    });

  }, [user, isLoading]);

  return {
    ...validationStatus,
    isLoading
  };
};
