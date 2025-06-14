
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';
import { supabase } from '@/integrations/supabase/client';

export const useSchoolScopedData = () => {
  const { user } = useAuth();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const isAdmin = MultiTenantUtils.isSystemAdmin(user.role);
      setIsSystemAdmin(isAdmin);
      setSchoolId(user.school_id || null);
      setUserRole(user.role);
      
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
    }
  }, [user]);

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
    return user && ['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(user.role);
  };

  const canManageSchools = () => {
    return user && ['elimisha_admin', 'edufam_admin'].includes(user.role);
  };

  const canViewAnalytics = () => {
    return user && ['elimisha_admin', 'edufam_admin', 'school_owner', 'principal'].includes(user.role);
  };

  const canManageFinances = () => {
    return user && ['elimisha_admin', 'edufam_admin', 'school_owner', 'principal', 'finance_officer'].includes(user.role);
  };

  const filterDataBySchoolScope = <T extends { school_id?: string }>(data: T[]): T[] => {
    if (isSystemAdmin) {
      return data; // System admins see all data
    }

    return data.filter(item => item.school_id === schoolId);
  };

  // Simplified query builder that returns the base query object
  const buildSchoolScopedQuery = (tableName: string, selectClause = '*') => {
    const baseQuery = supabase.from(tableName).select(selectClause);
    
    // System admins can access all data
    if (isSystemAdmin) {
      return baseQuery;
    }

    // Non-admin users are restricted to their school's data
    if (!schoolId) {
      throw new Error('User does not belong to any school');
    }

    // Add school_id filter for tables that have school_id directly
    return baseQuery.eq('school_id', schoolId);
  };

  return {
    isSystemAdmin,
    schoolId,
    userRole,
    getCurrentSchoolId,
    validateSchoolAccess,
    canManageUsers,
    canManageSchools,
    canViewAnalytics,
    canManageFinances,
    filterDataBySchoolScope,
    buildSchoolScopedQuery
  };
};
