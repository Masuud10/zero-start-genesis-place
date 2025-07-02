
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export class RoleResolver {
  /**
   * Resolves user role from database profile ONLY - no email fallbacks
   */
  static resolveRole(authUser: SupabaseUser, profileRole?: string): UserRole {
    console.log('🔍 RoleResolver: Resolving role for user:', authUser.email, {
      profileRole,
      userMetadataRole: authUser.user_metadata?.role,
      appMetadataRole: authUser.app_metadata?.role
    });

    // STRICT: Database role is primary and authoritative
    if (profileRole && this.isValidRole(profileRole)) {
      console.log('🔍 RoleResolver: Using database profile role:', profileRole);
      return profileRole as UserRole;
    }

    // Secondary: Check metadata (for admin-assigned roles)
    const metadataRole = authUser.app_metadata?.role || authUser.user_metadata?.role;
    if (metadataRole && this.isValidRole(metadataRole)) {
      console.log('🔍 RoleResolver: Using metadata role:', metadataRole);
      return metadataRole as UserRole;
    }

    // If no valid role found, return 'parent' as default
    console.warn('🔍 RoleResolver: No valid role found, defaulting to parent');
    return 'parent';
  }

  /**
   * Validates if a role is one of the allowed UserRole values
   */
  static isValidRole(role: string): boolean {
    const validRoles: UserRole[] = [
      'school_owner',
      'principal', 
      'teacher',
      'parent',
      'finance_officer',
      'edufam_admin'
    ];
    return validRoles.includes(role as UserRole);
  }

  /**
   * Determines fallback role based on email domain or defaults to 'parent'
   */
  static determineFallbackRole(email?: string): UserRole {
    if (!email) return 'parent';

    // Check for admin email patterns
    if (email.includes('admin') || email.includes('edufam')) {
      return 'edufam_admin';
    }

    // Check for school staff patterns
    if (email.includes('teacher') || email.includes('staff')) {
      return 'teacher';
    }

    if (email.includes('principal') || email.includes('head')) {
      return 'principal';
    }

    if (email.includes('owner') || email.includes('director')) {
      return 'school_owner';
    }

    if (email.includes('finance') || email.includes('accounts')) {
      return 'finance_officer';
    }

    // Default to parent for all other cases
    return 'parent';
  }

  /**
   * Checks if a role requires school assignment
   */
  static requiresSchoolAssignment(role: UserRole): boolean {
    const schoolRequiredRoles: UserRole[] = [
      'school_owner',
      'principal',
      'teacher', 
      'finance_officer'
    ];
    return schoolRequiredRoles.includes(role);
  }

  /**
   * Gets the default redirect path for a role
   */
  static getDefaultRedirectPath(role: UserRole, hasSchoolAssignment: boolean): string {
    switch (role) {
      case 'edufam_admin':
        return '/dashboard';
      case 'school_owner':
      case 'principal':
      case 'teacher':
      case 'finance_officer':
        return hasSchoolAssignment ? '/dashboard' : '/setup';
      case 'parent':
        return '/dashboard';
      default:
        return '/';
    }
  }
}
