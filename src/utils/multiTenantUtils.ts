import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

export class MultiTenantUtils {
  /**
   * Check if the current user is a system admin
   */
  static isSystemAdmin(role?: string): boolean {
    return role === 'elimisha_admin' || role === 'edufam_admin';
  }

  /**
   * Check if the current user is a school-level admin
   */
  static isSchoolAdmin(role?: string): boolean {
    return role === 'school_owner' || role === 'principal';
  }

  /**
   * Get the current user's school scope for data filtering
   */
  static async getCurrentUserScope(): Promise<{
    userId: string | null;
    userRole: string | null;
    schoolId: string | null;
    isSystemAdmin: boolean;
  }> {
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single();

      return {
        userId: user.id,
        userRole: profile?.role || null,
        schoolId: profile?.school_id || null,
        isSystemAdmin: this.isSystemAdmin(profile?.role)
      };
    } catch (error) {
      console.error('Error getting user scope:', error);
      return {
        userId: null,
        userRole: null,
        schoolId: null,
        isSystemAdmin: false
      };
    }
  }

  /**
   * Create a school-scoped query for any table
   */
  static async createScopedQuery(tableName: string, selectClause: string = '*') {
    const scope = await this.getCurrentUserScope();
    
    let query = supabase.from(tableName).select(selectClause);

    // System admins can see all data
    if (scope.isSystemAdmin) {
      return query;
    }

    // Non-admin users are scoped to their school
    if (!scope.schoolId) {
      throw new Error('User does not belong to any school');
    }

    // Apply school_id filter for tables that have it
    const schoolScopedTables = [
      'students', 'classes', 'subjects', 'announcements', 
      'messages', 'support_tickets', 'timetables'
    ];

    if (schoolScopedTables.includes(tableName)) {
      query = query.eq('school_id', scope.schoolId);
    }

    // For profiles, show only users in the same school or the user themselves
    if (tableName === 'profiles') {
      query = query.or(`id.eq.${scope.userId},school_id.eq.${scope.schoolId}`);
    }

    // For student-related tables (grades, attendance, fees, etc.)
    const studentRelatedTables = [
      'grades', 'attendance', 'fees', 'cbc_assessments',
      'competency_progress', 'learner_portfolios', 'parent_engagements'
    ];

    if (studentRelatedTables.includes(tableName)) {
      // These need to be filtered through student relationships
      const studentSubquery = supabase
        .from('students')
        .select('id')
        .eq('school_id', scope.schoolId);
      
      query = query.in('student_id', studentSubquery);
    }

    return query;
  }

  /**
   * Validate that a user can access a specific school's data
   */
  static async validateSchoolAccess(schoolId: string): Promise<boolean> {
    const scope = await this.getCurrentUserScope();

    // System admins can access any school
    if (scope.isSystemAdmin) {
      return true;
    }

    // Other users can only access their assigned school
    return scope.schoolId === schoolId;
  }

  /**
   * Ensure data is scoped to the user's school on insert/update
   */
  static async ensureSchoolScope(data: any, tableName: string): Promise<any> {
    const scope = await this.getCurrentUserScope();

    // System admins can work with any school data
    if (scope.isSystemAdmin) {
      return data;
    }

    // For non-admin users, enforce school scoping
    const schoolScopedTables = [
      'students', 'classes', 'subjects', 'announcements',
      'messages', 'support_tickets', 'timetables'
    ];

    if (schoolScopedTables.includes(tableName)) {
      if (!scope.schoolId) {
        throw new Error('User does not belong to any school');
      }
      
      // Override school_id to ensure data belongs to user's school
      data.school_id = scope.schoolId;
    }

    return data;
  }

  /**
   * Get role-specific capabilities
   */
  static getRoleCapabilities(role: UserRole): {
    canCreateUsers: boolean;
    canManageSchoolData: boolean;
    canViewSystemData: boolean;
    canCreateSchools: boolean;
  } {
    switch (role) {
      case 'elimisha_admin':
        return {
          canCreateUsers: true,
          canManageSchoolData: true,
          canViewSystemData: true,
          canCreateSchools: true
        };
      case 'edufam_admin':
        return {
          canCreateUsers: true,
          canManageSchoolData: true,
          canViewSystemData: true,
          canCreateSchools: false
        };
      case 'school_owner':
      case 'principal':
        return {
          canCreateUsers: true,
          canManageSchoolData: true,
          canViewSystemData: false,
          canCreateSchools: false
        };
      case 'teacher':
      case 'finance_officer':
        return {
          canCreateUsers: false,
          canManageSchoolData: true,
          canViewSystemData: false,
          canCreateSchools: false
        };
      case 'parent':
        return {
          canCreateUsers: false,
          canManageSchoolData: false,
          canViewSystemData: false,
          canCreateSchools: false
        };
      default:
        return {
          canCreateUsers: false,
          canManageSchoolData: false,
          canViewSystemData: false,
          canCreateSchools: false
        };
    }
  }
}
