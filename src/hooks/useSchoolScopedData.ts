
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export const useSchoolScopedData = () => {
  const { user } = useAuth();
  
  const schoolId = useMemo(() => {
    if (!user) return null;
    
    // For edufam_admin, they don't have a specific school
    if (user.role === 'edufam_admin') {
      return null;
    }
    
    return user.school_id || null;
  }, [user]);

  const isSystemAdmin = useMemo(() => {
    return user?.role === 'edufam_admin';
  }, [user]);

  const canAccessMultipleSchools = useMemo(() => {
    return user?.role === 'edufam_admin';
  }, [user]);

  const isReady = useMemo(() => {
    return user !== null;
  }, [user]);

  const validateSchoolAccess = useMemo(() => {
    return (targetSchoolId: string) => {
      if (isSystemAdmin) return true;
      return schoolId === targetSchoolId;
    };
  }, [isSystemAdmin, schoolId]);

  return {
    schoolId,
    isSystemAdmin,
    canAccessMultipleSchools,
    userRole: user?.role,
    isReady,
    validateSchoolAccess
  };
};
