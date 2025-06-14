
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

    // Priority 1: Profile role from database (most trusted)
    if (profileRole && this.isValidRole(profileRole)) {
      const normalizedRole = this.normalizeRole(profileRole);
      console.log('🔍 RoleResolver: Using profile role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 2: App metadata (set by admin)
    if (authUser.app_metadata?.role && this.isValidRole(authUser.app_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.app_metadata.role);
      console.log('🔍 RoleResolver: Using app_metadata role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 3: User metadata (from signup)
    if (authUser.user_metadata?.role && this.isValidRole(authUser.user_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.user_metadata.role);
      console.log('🔍 RoleResolver: Using user_metadata role:', normalizedRole);
      return normalizedRole;
    }

    // Priority 4: Email-based detection (fallback)
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
    
    // Direct mapping for exact matches
    if (this.VALID_ROLES.includes(normalized as UserRole)) {
      return normalized as UserRole;
    }
    
    // Handle variations
    const roleMap: Record<string, UserRole> = {
      'schoolowner': 'school_owner',
      'owner': 'school_owner',
      'financeofficer': 'finance_officer',
      'finance': 'finance_officer',
      'headteacher': 'principal',
      'head': 'principal'
    };
    
    return roleMap[normalized] || 'parent';
  }

  private static detectRoleFromEmail(email: string): UserRole {
    if (!email) return 'parent';
    
    const emailLower = email.toLowerCase();
    
    // Check admin emails first
    if (this.ADMIN_EMAILS.includes(emailLower)) {
      return 'edufam_admin';
    }
    
    // Check email patterns
    for (const [role, patterns] of Object.entries(this.EMAIL_PATTERNS)) {
      if (patterns.some(pattern => emailLower.includes(pattern))) {
        return role as UserRole;
      }
    }
    
    return 'parent';
  }
}
