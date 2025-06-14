
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useMultiTenantQuery = () => {
  const { user } = useAuth();

  const isSystemAdmin = () => {
    return user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';
  };

  const getCurrentUserSchoolId = () => {
    return user?.school_id;
  };

  const addSchoolFilter = (query: any, tableName: string) => {
    // System admins can access all data
    if (isSystemAdmin()) {
      return query;
    }

    // Non-admin users are restricted to their school's data
    const schoolId = getCurrentUserSchoolId();
    if (!schoolId) {
      throw new Error('User does not belong to any school');
    }

    // Add school_id filter based on table structure
    switch (tableName) {
      case 'students':
      case 'classes':
      case 'subjects':
      case 'timetables':
      case 'announcements':
      case 'support_tickets':
      case 'messages':
        return query.eq('school_id', schoolId);
      
      case 'profiles':
        return query.or(`id.eq.${user?.id},school_id.eq.${schoolId}`);
      
      case 'grades':
      case 'attendance':
      case 'fees':
      case 'cbc_assessments':
      case 'competency_progress':
      case 'learner_portfolios':
      case 'parent_engagements':
        // These tables are accessed through student relationships
        return query.in('student_id', 
          supabase
            .from('students')
            .select('id')
            .eq('school_id', schoolId)
        );
      
      default:
        return query;
    }
  };

  const createSchoolScopedQuery = (tableName: string, selectClause = '*') => {
    const baseQuery = supabase.from(tableName).select(selectClause);
    return addSchoolFilter(baseQuery, tableName);
  };

  const ensureSchoolAccess = (data: any, tableName: string) => {
    if (isSystemAdmin()) {
      return true;
    }

    const schoolId = getCurrentUserSchoolId();
    if (!schoolId) {
      return false;
    }

    // Check if data belongs to user's school
    if (data.school_id && data.school_id !== schoolId) {
      return false;
    }

    return true;
  };

  return {
    isSystemAdmin,
    getCurrentUserSchoolId,
    addSchoolFilter,
    createSchoolScopedQuery,
    ensureSchoolAccess
  };
};
