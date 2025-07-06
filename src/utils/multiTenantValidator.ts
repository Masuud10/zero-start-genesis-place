import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface User {
  id: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface Resource {
  school_id?: string;
  [key: string]: unknown;
}

interface QueryBuilder {
  eq: (column: string, value: string) => QueryBuilder;
  or: (condition: string) => QueryBuilder;
  [key: string]: unknown;
}

export class MultiTenantValidator {
  private user: User;
  private schoolId: string | null;
  private isSystemAdmin: boolean;

  constructor(user: User, schoolId: string | null, isSystemAdmin: boolean) {
    this.user = user;
    this.schoolId = schoolId;
    this.isSystemAdmin = isSystemAdmin;
  }

  validateSchoolAccess(targetSchoolId: string): boolean {
    // System admins can access all schools
    if (this.isSystemAdmin) {
      return true;
    }

    // Non-admin users can only access their assigned school
    if (!this.schoolId) {
      console.warn('User has no school assignment but trying to access school data');
      return false;
    }

    return this.schoolId === targetSchoolId;
  }

  validateResourceAccess(resource: Resource, resourceSchoolId?: string): boolean {
    // System admins have access to all resources
    if (this.isSystemAdmin) {
      return true;
    }

    // Check if resource belongs to user's school
    const targetSchoolId = resourceSchoolId || resource?.school_id;
    
    if (!targetSchoolId) {
      console.warn('Resource has no school_id - potential multi-tenancy violation');
      return false;
    }

    return this.validateSchoolAccess(targetSchoolId);
  }

  addSchoolFilter(query: QueryBuilder, tableName: string): QueryBuilder {
    // System admins don't need school filtering
    if (this.isSystemAdmin) {
      return query;
    }

    // Non-admin users are restricted to their school's data
    if (!this.schoolId) {
      console.warn('No schoolId for non-admin user, returning restrictive query');
      // Return a query that finds nothing
      return query.eq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Apply school filter based on table structure
    const tablesWithSchoolId = [
      'students', 'classes', 'subjects', 'timetables', 'announcements',
      'support_tickets', 'messages', 'grades', 'attendance', 'fees'
    ];

    if (tablesWithSchoolId.includes(tableName)) {
      return query.eq('school_id', this.schoolId);
    }

    // For profiles table, allow access to user's own profile and school members
    if (tableName === 'profiles') {
      return query.or(`id.eq.${this.user?.id},school_id.eq.${this.schoolId}`);
    }

    // Default: return query as-is for tables without school_id
    return query;
  }
}

// Factory function for creating validator instances
export const createMultiTenantValidator = (user: User, schoolId: string | null, isSystemAdmin: boolean): MultiTenantValidator => {
  return new MultiTenantValidator(user, schoolId, isSystemAdmin);
};
