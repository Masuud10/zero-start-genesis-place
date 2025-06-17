
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

  return {
    schoolId,
    isSystemAdmin,
    canAccessMultipleSchools,
    userRole: user?.role
  };
};
