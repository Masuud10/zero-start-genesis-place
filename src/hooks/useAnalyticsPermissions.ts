
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useMemo } from 'react';

export const useAnalyticsPermissions = () => {
  const { user } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canViewSystemAnalytics: false,
        canViewSchoolAnalytics: () => false,
        analyticsScope: 'none',
        allowedSchoolIds: []
      };
    }

    const canViewSystemAnalytics = user.role === 'edufam_admin';
    
    const canViewSchoolAnalytics = (targetSchoolId?: string) => {
      if (user.role === 'edufam_admin') return true;
      if (!schoolId) return false;
      if (targetSchoolId && targetSchoolId !== schoolId) return false;
      return ['principal', 'school_owner'].includes(user.role);
    };

    const analyticsScope = (() => {
      if (user.role === 'edufam_admin') return 'system';
      if (['principal', 'school_owner'].includes(user.role)) return 'school';
      if (user.role === 'teacher') return 'class';
      if (user.role === 'parent') return 'student';
      return 'none';
    })();

    const allowedSchoolIds = (() => {
      if (user.role === 'edufam_admin') return []; // All schools
      if (schoolId) return [schoolId];
      return [];
    })();

    return {
      canViewSystemAnalytics,
      canViewSchoolAnalytics,
      analyticsScope,
      allowedSchoolIds
    };
  }, [user, schoolId]);

  return permissions;
};
