
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSchoolScopedData = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const { toast } = useToast();

  const isSystemAdmin = useCallback(() => {
    return user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';
  }, [user?.role]);

  const getCurrentSchoolId = useCallback(() => {
    if (isSystemAdmin()) {
      return currentSchool?.id || user?.school_id;
    }
    return user?.school_id;
  }, [isSystemAdmin, currentSchool?.id, user?.school_id]);

  const createSchoolScopedQuery = useCallback((tableName: string, selectClause = '*') => {
    const schoolId = getCurrentSchoolId();
    
    // Use type assertion to handle the dynamic table name
    let query = (supabase as any).from(tableName).select(selectClause);

    // System admins can access all data
    if (isSystemAdmin()) {
      // If a specific school is selected, filter by it
      if (currentSchool?.id) {
        query = query.eq('school_id', currentSchool.id);
      }
      return query;
    }

    // Non-admin users are restricted to their school's data
    if (!schoolId) {
      throw new Error('User does not belong to any school');
    }

    // Add school_id filter for tables that have it directly
    if (['students', 'classes', 'subjects', 'announcements', 'support_tickets', 'timetables', 'messages'].includes(tableName)) {
      query = query.eq('school_id', schoolId);
    }
    
    // For tables accessed through student relationships, RLS policies will handle filtering
    
    return query;
  }, [isSystemAdmin, getCurrentSchoolId, currentSchool?.id]);

  const validateSchoolAccess = useCallback((data: any, requiredSchoolId?: string) => {
    if (isSystemAdmin()) {
      return true;
    }

    const userSchoolId = getCurrentSchoolId();
    if (!userSchoolId) {
      return false;
    }

    const targetSchoolId = requiredSchoolId || data?.school_id;
    if (targetSchoolId && targetSchoolId !== userSchoolId) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this data.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [isSystemAdmin, getCurrentSchoolId, toast]);

  const insertWithSchoolId = useCallback(async (tableName: string, data: any) => {
    const schoolId = getCurrentSchoolId();
    
    if (!isSystemAdmin() && !schoolId) {
      throw new Error('School assignment required');
    }

    // Add school_id for tables that require it
    if (['students', 'classes', 'subjects', 'announcements', 'support_tickets', 'timetables', 'messages'].includes(tableName)) {
      data.school_id = schoolId;
    }

    return (supabase as any).from(tableName).insert(data);
  }, [isSystemAdmin, getCurrentSchoolId]);

  return {
    isSystemAdmin: isSystemAdmin(),
    getCurrentSchoolId,
    createSchoolScopedQuery,
    validateSchoolAccess,
    insertWithSchoolId,
    currentSchool
  };
};
