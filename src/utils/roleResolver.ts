export class RoleResolver {
  /**
   * Resolves the final role for a user based on auth user data and profile role
   */
  static resolveRole(authUser: any, profileRole?: string): string {
    console.log('🔑 RoleResolver: Resolving role for user:', {
      email: authUser?.email,
      authMetaRole: authUser?.user_metadata?.role,
      profileRole,
      authAppMetaRole: authUser?.app_metadata?.role
    });

    // Priority 1: Profile role (from database)
    if (profileRole) {
      console.log('🔑 RoleResolver: Using profile role:', profileRole);
      return profileRole;
    }

    // Priority 2: Auth user metadata role
    if (authUser?.user_metadata?.role) {
      console.log('🔑 RoleResolver: Using auth metadata role:', authUser.user_metadata.role);
      return authUser.user_metadata.role;
    }

    // Priority 3: Auth app metadata role
    if (authUser?.app_metadata?.role) {
      console.log('🔑 RoleResolver: Using auth app metadata role:', authUser.app_metadata.role);
      return authUser.app_metadata.role;
    }

    // Priority 4: Email-based role detection
    if (authUser?.email) {
      const emailRole = this.detectRoleFromEmail(authUser.email);
      if (emailRole !== 'parent') {
        console.log('🔑 RoleResolver: Using email-detected role:', emailRole);
        return emailRole;
      }
    }

    // Default: parent role
    console.log('🔑 RoleResolver: Using default role: parent');
    return 'parent';
  }

  /**
   * Detects role based on email patterns
   */
  private static detectRoleFromEmail(email: string): string {
    const emailLower = email.toLowerCase();

    // System admin patterns
    if (emailLower.includes('@edufam.com') || emailLower === 'masuud@gmail.com') {
      return 'edufam_admin';
    }

    if (emailLower.includes('admin@') || emailLower.includes('edufam')) {
      return 'edufam_admin';
    }

    // School role patterns
    if (emailLower.includes('principal') || emailLower.includes('headteacher')) {
      return 'principal';
    }

    if (emailLower.includes('owner') || emailLower.includes('proprietor')) {
      return 'school_owner';
    }

    if (emailLower.includes('teacher') || emailLower.includes('tutor')) {
      return 'teacher';
    }

    if (emailLower.includes('finance') || emailLower.includes('accounts') || emailLower.includes('bursar')) {
      return 'finance_officer';
    }

    // Default role
    return 'parent';
  }

  /**
   * Validates if a role is valid
   */
  static isValidRole(role: string): boolean {
    const validRoles = [
      'edufam_admin',
      'school_owner',
      'principal',
      'teacher',
      'parent',
      'finance_officer'
    ];

    return validRoles.includes(role);
  }

  /**
   * Gets role hierarchy level (higher number = more permissions)
   */
  static getRoleLevel(role: string): number {
    const roleLevels: Record<string, number> = {
      'edufam_admin': 100,
      'school_owner': 80,
      'principal': 70,
      'finance_officer': 50,
      'teacher': 40,
      'parent': 10
    };

    return roleLevels[role] || 0;
  }

  /**
   * Checks if user can manage another user based on roles
   */
  static canManageRole(managerRole: string, targetRole: string): boolean {
    const managerLevel = this.getRoleLevel(managerRole);
    const targetLevel = this.getRoleLevel(targetRole);

    // System admins can manage everyone
    if (managerRole === 'edufam_admin') {
      return true;
    }

    // School admins can manage school-level roles (but not system admins)
    if (managerRole === 'school_owner' || managerRole === 'principal') {
      return targetLevel < 90 && managerLevel > targetLevel;
    }

    // Others cannot manage roles
    return false;
  }
}
