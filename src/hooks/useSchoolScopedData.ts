
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

export const useSchoolScopedData = () => {
  const { user, isLoading } = useAuth();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsReady(false);
      return;
    }

    if (user) {
      const isAdmin = MultiTenantUtils.isSystemAdmin(user.role);
      setIsSystemAdmin(isAdmin);
      setSchoolId(user.school_id || null);
      setUserRole(user.role);
      setIsReady(true);
      
      console.log('🏫 useSchoolScopedData: Updated scope:', {
        userId: user.id,
        userRole: user.role,
        schoolId: user.school_id,
        isSystemAdmin: isAdmin
      });
    } else {
      setIsSystemAdmin(false);
      setSchoolId(null);
      setUserRole(null);
      setIsReady(true);
    }
  }, [user, isLoading]);

  const validateSchoolAccess = useCallback((targetSchoolId: string) => {
    if (isSystemAdmin) {
      return true; // System admins can access any school
    }
    
    return schoolId === targetSchoolId;
  }, [isSystemAdmin, schoolId]);

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
    if (isSystemAdmin) {
      return data; // System admins see all data
    }

    return data.filter(item => item.school_id === schoolId);
  }, [isSystemAdmin, schoolId]);

  return {
    isSystemAdmin,
    schoolId,
    userRole,
    isReady,
    validateSchoolAccess,
    canManageUsers,
    canManageSchools,
    canViewAnalytics,
    canManageFinances,
    filterDataBySchoolScope
  };
};
