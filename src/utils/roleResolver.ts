
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export class RoleResolver {
  /**
   * Resolves the user role from various sources with proper fallbacks
   */
  static resolveRole(authUser: SupabaseUser, profileRole?: string): UserRole {
    console.log('🔍 RoleResolver: Resolving role for user:', authUser.email);
    console.log('🔍 RoleResolver: Available sources:', {
      profileRole,
      userMetadataRole: authUser.user_metadata?.role,
      appMetadataRole: authUser.app_metadata?.role,
      email: authUser.email
    });

    // Priority order for role resolution
    const candidates = [
      profileRole,
      authUser.user_metadata?.role,
      authUser.app_metadata?.role
    ].filter(Boolean);

    console.log('🔍 RoleResolver: Role candidates:', candidates);

    // Valid roles in the system
    const validRoles: UserRole[] = [
      'school_owner',
      'principal', 
      'teacher',
      'parent',
      'finance_officer',
      'edufam_admin'
    ];

    // Find first valid role
    for (const candidate of candidates) {
      if (validRoles.includes(candidate as UserRole)) {
        console.log('🔍 RoleResolver: Selected role:', candidate);
        return candidate as UserRole;
      }
    }

    // Email-based role assignment for development
    const email = authUser.email?.toLowerCase() || '';
    
    if (email.includes('admin') || email.includes('edufam')) {
      console.log('🔍 RoleResolver: Assigned edufam_admin role based on email');
      return 'edufam_admin';
    }
    
    if (email.includes('principal')) {
      console.log('🔍 RoleResolver: Assigned principal role based on email');
      return 'principal';
    }
    
    if (email.includes('teacher')) {
      console.log('🔍 RoleResolver: Assigned teacher role based on email');
      return 'teacher';
    }
    
    if (email.includes('owner')) {
      console.log('🔍 RoleResolver: Assigned school_owner role based on email');
      return 'school_owner';
    }

    // Default fallback
    console.log('🔍 RoleResolver: Using default parent role');
    return 'parent';
  }

  /**
   * Validates if a role is valid in the system
   */
  static isValidRole(role: string): role is UserRole {
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
   * Gets display name for a role
   */
  static getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      'school_owner': 'School Owner',
      'principal': 'Principal',
      'teacher': 'Teacher',
      'parent': 'Parent',
      'finance_officer': 'Finance Officer',
      'edufam_admin': 'EduFam Admin'
    };

    return roleNames[role] || role;
  }
}
