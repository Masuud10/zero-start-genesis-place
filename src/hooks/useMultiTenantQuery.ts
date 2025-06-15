
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useSchoolScopedData } from './useSchoolScopedData';

type TableName = keyof Database['public']['Tables'];

export const useMultiTenantQuery = () => {
  const { user } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const addSchoolFilter = (query: any, tableName: TableName) => {
    // System admins can access all data
    if (isSystemAdmin) {
      return query;
    }

    // Non-admin users are restricted to their school's data
    if (!schoolId) {
      console.warn('useMultiTenantQuery: No schoolId for non-admin, returning empty query.');
      return query.eq('id', '00000000-0000-0000-0000-000000000000'); // Return a query that finds nothing
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
      case 'grades':
      case 'attendance':
      case 'fees':
        return query.eq('school_id', schoolId);
      
      case 'profiles':
        return query.or(`id.eq.${user?.id},school_id.eq.${schoolId}`);
      
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

  const createSchoolScopedQuery = (tableName: TableName, selectClause = '*') => {
    const baseQuery = supabase.from(tableName).select(selectClause);
    return addSchoolFilter(baseQuery, tableName);
  };

  const ensureSchoolAccess = (data: any, tableName: TableName) => {
    if (isSystemAdmin) {
      return true;
    }

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
    schoolId,
    addSchoolFilter,
    createSchoolScopedQuery,
    ensureSchoolAccess
  };
};
