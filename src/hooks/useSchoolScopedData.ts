
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

export const useSchoolScopedData = () => {
  const { user, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Memoize derived values to prevent unnecessary recalculations
  const derivedValues = useMemo(() => {
    if (isLoading || !user) {
      return {
        isSystemAdmin: false,
        schoolId: null,
        userRole: null,
      };
    }

    const isAdmin = MultiTenantUtils.isSystemAdmin(user.role);
    return {
      isSystemAdmin: isAdmin,
      schoolId: user.school_id || null,
      userRole: user.role,
    };
  }, [user, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setIsReady(false);
      return;
    }

    setIsReady(true);
    
    console.log('🏫 useSchoolScopedData: Updated scope:', {
      userId: user?.id,
      userRole: derivedValues.userRole,
      schoolId: derivedValues.schoolId,
      isSystemAdmin: derivedValues.isSystemAdmin
    });
  }, [user, isLoading, derivedValues]);

  // Memoize permission check functions to avoid recreation on every render
  const validateSchoolAccess = useCallback((targetSchoolId: string) => {
    if (derivedValues.isSystemAdmin) {
      return true; // System admins can access any school
    }
    
    return derivedValues.schoolId === targetSchoolId;
  }, [derivedValues.isSystemAdmin, derivedValues.schoolId]);

  const canManageUsers = useCallback(() => {
    return user && ['edufam_admin', 'school_owner', 'principal'].includes(user.role);
  }, [user]);

  const canManageSchools = useCallback(() => {
    return user && ['edufam_admin'].includes(user.role);
  }, [user]);

  const canViewAnalytics = useCallback(() => {
    return user && ['edufam_admin', 'school_owner', 'principal'].includes(user.role);
  }, [user]);

  const canManageFinances = useCallback(() => {
    return user && ['edufam_admin', 'school_owner', 'principal', 'finance_officer'].includes(user.role);
  }, [user]);

  const filterDataBySchoolScope = useCallback(<T extends { school_id?: string }>(data: T[]): T[] => {
    if (derivedValues.isSystemAdmin) {
      return data; // System admins see all data
    }

    return data.filter(item => item.school_id === derivedValues.schoolId);
  }, [derivedValues.isSystemAdmin, derivedValues.schoolId]);

  return {
    isSystemAdmin: derivedValues.isSystemAdmin,
    schoolId: derivedValues.schoolId,
    userRole: derivedValues.userRole,
    isReady,
    validateSchoolAccess,
    canManageUsers,
    canManageSchools,
    canViewAnalytics,
    canManageFinances,
    filterDataBySchoolScope
  };
};
