
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
      appMetadataRole: authUser.app_metadata?.role,
      rawUserMetadata: authUser.user_metadata,
      rawAppMetadata: authUser.app_metadata
    });

    // Priority 1: Profile role from database (most authoritative)
    if (profileRole && this.isValidRole(profileRole)) {
      const normalizedRole = this.normalizeRole(profileRole);
      console.log('🔍 RoleResolver: Using profile role:', profileRole, '-> normalized:', normalizedRole);
      return normalizedRole;
    }

    // Priority 2: App metadata (server-side set, very authoritative)
    if (authUser.app_metadata?.role && this.isValidRole(authUser.app_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.app_metadata.role);
      console.log('🔍 RoleResolver: Using app_metadata role:', authUser.app_metadata.role, '-> normalized:', normalizedRole);
      return normalizedRole;
    }

    // Priority 3: User metadata (client-side set during signup)
    if (authUser.user_metadata?.role && this.isValidRole(authUser.user_metadata.role)) {
      const normalizedRole = this.normalizeRole(authUser.user_metadata.role);
      console.log('🔍 RoleResolver: Using user_metadata role:', authUser.user_metadata.role, '-> normalized:', normalizedRole);
      return normalizedRole;
    }

    // Priority 4: Email-based role detection (fallback)
    const emailRole = this.detectRoleFromEmail(authUser.email || '');
    console.log('🔍 RoleResolver: Using email-based role detection:', emailRole);
    return emailRole;
  }

  private static isValidRole(role: string): boolean {
    const normalized = this.normalizeRole(role);
    const isValid = this.VALID_ROLES.includes(normalized);
    console.log('🔍 RoleResolver: Role validation:', role, '-> normalized:', normalized, '-> valid:', isValid);
    return isValid;
  }

  private static normalizeRole(role: string): UserRole {
    if (!role) {
      console.log('🔍 RoleResolver: Empty role, defaulting to parent');
      return 'parent';
    }
    
    const normalized = role.toLowerCase().trim();
    console.log('🔍 RoleResolver: Normalizing role:', role, '-> lowercase:', normalized);
    
    // Handle admin role variations
    if (['elimisha_admin', 'edufam_admin', 'admin', 'systemadmin', 'system_admin'].includes(normalized)) {
      console.log('🔍 RoleResolver: Detected admin role variant:', normalized, '-> edufam_admin');
      return 'edufam_admin';
    }
    
    // Handle other role variations
    const roleMap: Record<string, UserRole> = {
      'school_owner': 'school_owner',
      'schoolowner': 'school_owner',
      'owner': 'school_owner',
      'proprietor': 'school_owner',
      'finance_officer': 'finance_officer',
      'financeofficer': 'finance_officer',
      'finance': 'finance_officer',
      'accountant': 'finance_officer',
      'principal': 'principal',
      'headteacher': 'principal',
      'head_teacher': 'principal',
      'teacher': 'teacher',
      'instructor': 'teacher',
      'parent': 'parent',
      'guardian': 'parent'
    };
    
    const mappedRole = roleMap[normalized] || 'parent';
    console.log('🔍 RoleResolver: Role mapping result:', normalized, '->', mappedRole);
    return mappedRole;
  }

  private static detectRoleFromEmail(email: string): UserRole {
    if (!email) {
      console.log('🔍 RoleResolver: No email provided, defaulting to parent');
      return 'parent';
    }
    
    const emailLower = email.toLowerCase();
    console.log('🔍 RoleResolver: Detecting role from email:', emailLower);
    
    // Check admin emails first
    if (this.ADMIN_EMAILS.includes(emailLower)) {
      console.log('🔍 RoleResolver: Email found in admin list:', emailLower);
      return 'edufam_admin';
    }
    
    // Check email patterns
    for (const [role, patterns] of Object.entries(this.EMAIL_PATTERNS)) {
      const matchedPattern = patterns.find(pattern => emailLower.includes(pattern));
      if (matchedPattern) {
        console.log('🔍 RoleResolver: Email pattern matched:', emailLower, 'pattern:', matchedPattern, 'role:', role);
        return role as UserRole;
      }
    }
    
    console.log('🔍 RoleResolver: No email pattern matched, defaulting to parent');
    return 'parent';
  }

  // New method to validate and get detailed role information
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
        emailBasedRole: this.detectRoleFromEmail(authUser.email || ''),
        normalizedEmail: authUser.email?.toLowerCase()
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
