
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export class RoleResolver {
  private static readonly VALID_ROLES: UserRole[] = [
    'school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'
  ];

  private static readonly ADMIN_EMAILS = [
    'masuud@gmail.com'
  ];

  private static readonly EMAIL_PATTERNS = {
    'edufam_admin': ['@elimisha.com', 'admin@', 'system@'],
    'principal': ['principal@', 'head@'],
    'teacher': ['teacher@', 'staff@'],
    'school_owner': ['owner@', 'proprietor@'],
    'finance_officer': ['finance@', 'accounts@']
  };

  static resolveRole(authUser: User, profileRole?: string): UserRole {
    console.log('🔍 RoleResolver: Resolving role for user:', authUser.email, {
      profileRole,
      userMetadataRole: authUser.user_metadata?.role,
      appMetadataRole: authUser.app_metadata?.role
    });

    // Priority 1: Profile role from database
    if (profileRole && this.isValidRole(profileRole)) {
      const normalizedRole = this.normalizeRole(profileRole);
      console.log('🔍 RoleResolver: Using profile role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 2: App metadata
    if (authUser.app_metadata?.role && this.isValidRole(authUser.app_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.app_metadata.role);
      console.log('🔍 RoleResolver: Using app_metadata role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 3: User metadata
    if (authUser.user_metadata?.role && this.isValidRole(authUser.user_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.user_metadata.role);
      console.log('🔍 RoleResolver: Using user_metadata role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 4: Email-based detection
    const emailRole = this.detectRoleFromEmail(authUser.email || '');
    console.log('🔍 RoleResolver: Using email-based role:', emailRole);
    return emailRole;
  }

  private static isValidRole(role: string): boolean {
    if (!role) return false;
    const normalized = this.normalizeRole(role);
    return this.VALID_ROLES.includes(normalized);
  }

  private static normalizeRole(role: string): UserRole {
    if (!role) return 'parent';
    
    const normalized = role.toLowerCase().trim();
    
    // Handle admin variations
    if (['elimisha_admin', 'edufam_admin', 'admin'].includes(normalized)) {
      return 'edufam_admin';
    }
    
    // Handle other variations
    const roleMap: Record<string, UserRole> = {
      'school_owner': 'school_owner',
      'schoolowner': 'school_owner',
      'owner': 'school_owner',
      'finance_officer': 'finance_officer',
      'financeofficer': 'finance_officer',
      'finance': 'finance_officer',
      'principal': 'principal',
      'headteacher': 'principal',
      'teacher': 'teacher',
      'parent': 'parent'
    };
    
    return roleMap[normalized] || 'parent';
  }

  private static detectRoleFromEmail(email: string): UserRole {
    if (!email) return 'parent';
    
    const emailLower = email.toLowerCase();
    
    // Check admin emails
    if (this.ADMIN_EMAILS.includes(emailLower)) {
      return 'edufam_admin';
    }
    
    // Check patterns
    for (const [role, patterns] of Object.entries(this.EMAIL_PATTERNS)) {
      if (patterns.some(pattern => emailLower.includes(pattern))) {
        return role as UserRole;
      }
    }
    
    return 'parent';
  }

  static getRoleInfo(authUser: User, profileRole?: string) {
    const resolvedRole = this.resolveRole(authUser, profileRole);
    return {
      role: resolvedRole,
      source: this.getRoleSource(authUser, profileRole),
      isValid: this.VALID_ROLES.includes(resolvedRole),
      debugInfo: {
        profileRole,
        userMetadataRole: authUser.user_metadata?.role,
        appMetadataRole: authUser.app_metadata?.role,
        emailBasedRole: this.detectRoleFromEmail(authUser.email || '')
      }
    };
  }

  private static getRoleSource(authUser: User, profileRole?: string): string {
    if (profileRole && this.isValidRole(profileRole)) return 'profile';
    if (authUser.app_metadata?.role && this.isValidRole(authUser.app_metadata.role)) return 'app_metadata';
    if (authUser.user_metadata?.role && this.isValidRole(authUser.user_metadata.role)) return 'user_metadata';
    return 'email_pattern';
  }
}
