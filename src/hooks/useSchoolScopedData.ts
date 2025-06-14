
import { useState, useEffect } from 'react';
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

  const getCurrentSchoolId = () => {
    return schoolId;
  };

  const validateSchoolAccess = (targetSchoolId: string) => {
    if (isSystemAdmin) {
      return true; // System admins can access any school
    }
    
    return schoolId === targetSchoolId;
  };

  const canManageUsers = () => {
    return user && ['edufam_admin', 'school_owner', 'principal'].includes(user.role);
  };

  const canManageSchools = () => {
    return user && ['edufam_admin'].includes(user.role);
  };

  const canViewAnalytics = () => {
    return user && ['edufam_admin', 'school_owner', 'principal'].includes(user.role);
  };

  const canManageFinances = () => {
    return user && ['edufam_admin', 'school_owner', 'principal', 'finance_officer'].includes(user.role);
  };

  const filterDataBySchoolScope = <T extends { school_id?: string }>(data: T[]): T[] => {
    if (isSystemAdmin) {
      return data; // System admins see all data
    }

    return data.filter(item => item.school_id === schoolId);
  };

  return {
    isSystemAdmin,
    schoolId,
    userRole,
    isReady,
    getCurrentSchoolId,
    validateSchoolAccess,
    canManageUsers,
    canManageSchools,
    canViewAnalytics,
    canManageFinances,
    filterDataBySchoolScope
  };
};
