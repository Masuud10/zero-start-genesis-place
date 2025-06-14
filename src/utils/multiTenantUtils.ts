
import { supabase } from '@/integrations/supabase/client';

interface UserScope {
  userId: string | null;
  userRole: string | null;
  schoolId: string | null;
  isSystemAdmin: boolean;
}

interface RoleCapabilities {
  canCreateUsers: boolean;
  canCreateSchools: boolean;
  canViewAllSchools: boolean;
  canManageFinance: boolean;
  canViewAnalytics: boolean;
}

export class MultiTenantUtils {
  static async getCurrentUserScope(): Promise<UserScope> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          userId: null,
          userRole: null,
          schoolId: null,
          isSystemAdmin: false
        };
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('MultiTenantUtils: Error fetching user profile:', error);
        return {
          userId: user.id,
          userRole: null,
          schoolId: null,
          isSystemAdmin: false
        };
      }

      const userRole = profile?.role;
      const isSystemAdmin = userRole === 'elimisha_admin' || userRole === 'edufam_admin';

      return {
        userId: user.id,
        userRole,
        schoolId: profile?.school_id || null,
        isSystemAdmin
      };
    } catch (error) {
      console.error('MultiTenantUtils: Error getting user scope:', error);
      return {
        userId: null,
        userRole: null,
        schoolId: null,
        isSystemAdmin: false
      };
    }
  }

  static getRoleCapabilities(role: string): RoleCapabilities {
    switch (role) {
      case 'elimisha_admin':
      case 'edufam_admin':
        return {
          canCreateUsers: true,
          canCreateSchools: true,
          canViewAllSchools: true,
          canManageFinance: true,
          canViewAnalytics: true
        };
      
      case 'school_owner':
      case 'principal':
        return {
          canCreateUsers: true,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: true,
          canViewAnalytics: true
        };
      
      case 'teacher':
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: false,
          canViewAnalytics: false
        };
      
      case 'parent':
      case 'finance_officer':
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: role === 'finance_officer',
          canViewAnalytics: false
        };
      
      default:
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: false,
          canViewAnalytics: false
        };
    }
  }

  static isSystemAdmin(role: string): boolean {
    return role === 'elimisha_admin' || role === 'edufam_admin';
  }

  static isSchoolAdmin(role: string): boolean {
    return role === 'school_owner' || role === 'principal';
  }

  static canAccessSchool(userRole: string, userSchoolId: string | null, targetSchoolId: string): boolean {
    // System admins can access any school
    if (this.isSystemAdmin(userRole)) {
      return true;
    }

    // School-level users can only access their own school
    return userSchoolId === targetSchoolId;
  }

  static filterDataByTenant<T extends { school_id?: string }>(
    data: T[], 
    userRole: string, 
    userSchoolId: string | null
  ): T[] {
    // System admins see all data
    if (this.isSystemAdmin(userRole)) {
      return data;
    }

    // School-level users only see their school's data
    return data.filter(item => item.school_id === userSchoolId);
  }
}
