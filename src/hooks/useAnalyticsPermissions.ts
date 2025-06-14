
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useCallback } from 'react';

export const useAnalyticsPermissions = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();

  const canViewSystemAnalytics = useCallback(() => {
    return user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';
  }, [user?.role]);

  const canViewSchoolAnalytics = useCallback((schoolId?: string) => {
    // System admins can view any school's analytics
    if (canViewSystemAnalytics()) {
      return true;
    }

    // School-level users can only view their own school's analytics
    const userSchoolId = user?.school_id;
    const targetSchoolId = schoolId || currentSchool?.id;
    
    return userSchoolId && targetSchoolId && userSchoolId === targetSchoolId;
  }, [user?.school_id, currentSchool?.id, canViewSystemAnalytics]);

  const canManageAnalytics = useCallback(() => {
    return ['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(user?.role || '');
  }, [user?.role]);

  const getAnalyticsScope = useCallback(() => {
    if (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') {
      return 'system';
    }
    if (['school_owner', 'principal'].includes(user?.role || '')) {
      return 'school';
    }
    if (user?.role === 'teacher') {
      return 'class';
    }
    if (user?.role === 'parent') {
      return 'student';
    }
    return 'none';
  }, [user?.role]);

  const getAllowedSchoolIds = useCallback(() => {
    if (canViewSystemAnalytics()) {
      return null; // Can view all schools
    }
    return user?.school_id ? [user.school_id] : [];
  }, [user?.school_id, canViewSystemAnalytics]);

  return {
    canViewSystemAnalytics: canViewSystemAnalytics(),
    canViewSchoolAnalytics,
    canManageAnalytics: canManageAnalytics(),
    analyticsScope: getAnalyticsScope(),
    allowedSchoolIds: getAllowedSchoolIds()
  };
};
