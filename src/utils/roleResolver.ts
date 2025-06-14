
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
      console.log('🔍 RoleResolver: Using profile role:', profileRole);
      return this.normalizeRole(profileRole);
    }

    // Priority 2: App metadata (server-side set)
    if (authUser.app_metadata?.role && this.isValidRole(authUser.app_metadata.role)) {
      console.log('🔍 RoleResolver: Using app_metadata role:', authUser.app_metadata.role);
      return this.normalizeRole(authUser.app_metadata.role);
    }

    // Priority 3: User metadata (client-side set during signup)
    if (authUser.user_metadata?.role && this.isValidRole(authUser.user_metadata.role)) {
      console.log('🔍 RoleResolver: Using user_metadata role:', authUser.user_metadata.role);
      return this.normalizeRole(authUser.user_metadata.role);
    }

    // Priority 4: Email-based role detection
    const emailRole = this.detectRoleFromEmail(authUser.email || '');
    console.log('🔍 RoleResolver: Using email-based role:', emailRole);
    return emailRole;
  }

  private static isValidRole(role: string): boolean {
    return this.VALID_ROLES.includes(this.normalizeRole(role));
  }

  private static normalizeRole(role: string): UserRole {
    if (!role) return 'parent';
    
    const normalized = role.toLowerCase().trim();
    
    // Handle admin role variations
    if (['elimisha_admin', 'edufam_admin', 'admin', 'systemadmin'].includes(normalized)) {
      return 'edufam_admin';
    }
    
    // Handle other role variations
    const roleMap: Record<string, UserRole> = {
      'school_owner': 'school_owner',
      'schoolowner': 'school_owner',
      'owner': 'school_owner',
      'finance_officer': 'finance_officer',
      'financeofficer': 'finance_officer',
      'finance': 'finance_officer',
      'principal': 'principal',
      'teacher': 'teacher',
      'parent': 'parent'
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
