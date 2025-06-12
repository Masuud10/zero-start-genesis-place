import { UserRole } from '@/types/user';

export interface Permission {
  resource: string;
  action: string;
  scope?: 'own' | 'school' | 'class' | 'all' | 'child';
}

export const PERMISSIONS = {
  // Gradebook permissions
  VIEW_GRADEBOOK: 'view_gradebook',
  EDIT_GRADEBOOK: 'edit_gradebook',
  
  // Position permissions
  VIEW_POSITION: 'view_position',
  
  // Fee balance permissions
  VIEW_FEE_BALANCE: 'view_fee_balance',
  EDIT_FEE_BALANCE: 'edit_fee_balance',
  
  // Announcement permissions
  VIEW_ANNOUNCEMENTS: 'view_announcements',
  POST_ANNOUNCEMENTS: 'post_announcements',
  
  // Timetable permissions
  VIEW_TIMETABLE: 'view_timetable',
  EDIT_TIMETABLE: 'edit_timetable',
  
  // Class information permissions
  VIEW_CLASS_INFO: 'view_class_info',
  EDIT_CLASS_INFO: 'edit_class_info',
  
  // Multi-tenancy permissions
  VIEW_OTHER_SCHOOLS: 'view_other_schools',
  
  // User management permissions
  MANAGE_USERS: 'manage_users',
  
  // Messaging permissions
  SEND_MESSAGES: 'send_messages',
  
  // Push notification permissions
  SEND_PUSH_NOTIFICATIONS: 'send_push_notifications',
  
  // AI Learning permissions
  USE_AI_LEARNING: 'use_ai_learning'
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission matrix based on the provided specification
export const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionKey, { allowed: boolean; scope?: string }>> = {
  edufam_admin: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.MANAGE_USERS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'all' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  },
  
  elimisha_admin: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.MANAGE_USERS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'all' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  },

  school_owner: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  },

  principal: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: false },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  },

  teacher: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'class' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: false },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: false },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'class' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'class' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: false },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'class' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  },

  parent: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'child' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false },
    [PERMISSIONS.VIEW_POSITION]: { allowed: true, scope: 'child' },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'child' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: false },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'relevant' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: false },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'child' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: false },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'child' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: false },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: false },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'teachers' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: false },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: true, scope: 'child' }
  },

  finance_officer: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: false },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false },
    [PERMISSIONS.VIEW_POSITION]: { allowed: false },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: false },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: false },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: false },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: false },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: false },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false }
  }
};

export class PermissionManager {
  private userRole: UserRole;
  private userSchoolId?: string;
  private userClassIds: string[];

  constructor(userRole: UserRole, userSchoolId?: string, userClassIds: string[] = []) {
    this.userRole = userRole;
    this.userSchoolId = userSchoolId;
    this.userClassIds = userClassIds;
  }

  hasPermission(permission: PermissionKey): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.userRole];
    if (!rolePermissions) return false;
    
    const permissionConfig = rolePermissions[permission];
    return permissionConfig?.allowed || false;
  }

  getPermissionScope(permission: PermissionKey): string | undefined {
    const rolePermissions = ROLE_PERMISSIONS[this.userRole];
    if (!rolePermissions) return undefined;
    
    const permissionConfig = rolePermissions[permission];
    return permissionConfig?.scope;
  }

  canAccessSchool(schoolId: string): boolean {
    // System admins can access all schools
    if (this.userRole === 'elimisha_admin' || this.userRole === 'edufam_admin') {
      return true;
    }
    
    // Other users can only access their own school
    return this.userSchoolId === schoolId;
  }

  canAccessClass(classId: string): boolean {
    const scope = this.getPermissionScope(PERMISSIONS.VIEW_CLASS_INFO);
    
    if (scope === 'all') return true;
    if (scope === 'school') return true; // School-level users can access all classes in their school
    if (scope === 'class') return this.userClassIds?.includes(classId) || false;
    
    return false;
  }

  canAccessStudent(studentId: string, studentSchoolId?: string): boolean {
    // System admin roles can access all students
    if (this.userRole === 'elimisha_admin' || this.userRole === 'edufam_admin') {
      return true;
    }

    // School-level roles can access students in their school
    if (['school_owner', 'principal'].includes(this.userRole)) {
      return this.userSchoolId === studentSchoolId;
    }

    // Teachers can access students in their school (will be further filtered by class in actual queries)
    if (this.userRole === 'teacher') {
      return this.userSchoolId === studentSchoolId;
    }

    // Parents can only access their own children (implementation depends on parent-child relationships)
    if (this.userRole === 'parent') {
      // This would need to be enhanced with actual parent-child relationship checking
      return false; // Placeholder - would check parent-child relationship in real implementation
    }

    // Finance officers can access students in their school for fee-related data
    if (this.userRole === 'finance_officer') {
      return this.userSchoolId === studentSchoolId;
    }

    return false;
  }

  // Check if user can create/modify data for a specific school
  canModifySchoolData(targetSchoolId?: string): boolean {
    // System admins can modify data for any school
    if (this.userRole === 'elimisha_admin' || this.userRole === 'edufam_admin') {
      return true;
    }

    // Other users can only modify data for their own school
    if (!targetSchoolId || !this.userSchoolId) {
      return false;
    }

    return this.userSchoolId === targetSchoolId;
  }

  // Get the school context for queries
  getSchoolContext(): { schoolId?: string; isSystemAdmin: boolean } {
    return {
      schoolId: this.userSchoolId,
      isSystemAdmin: this.userRole === 'elimisha_admin' || this.userRole === 'edufam_admin'
    };
  }

  getFilteredMenuItems() {
    const allMenuItems = [
      { id: 'dashboard', permission: null },
      { id: 'analytics', permission: null },
      { id: 'grades', permission: PERMISSIONS.VIEW_GRADEBOOK },
      { id: 'attendance', permission: null },
      { id: 'students', permission: PERMISSIONS.VIEW_CLASS_INFO },
      { id: 'finance', permission: PERMISSIONS.VIEW_FEE_BALANCE },
      { id: 'timetable', permission: PERMISSIONS.VIEW_TIMETABLE },
      { id: 'announcements', permission: PERMISSIONS.VIEW_ANNOUNCEMENTS },
      { id: 'messages', permission: PERMISSIONS.SEND_MESSAGES },
      { id: 'reports', permission: null },
      { id: 'support', permission: null },
      { id: 'settings', permission: null },
      { id: 'schools', permission: PERMISSIONS.VIEW_OTHER_SCHOOLS },
      { id: 'users', permission: PERMISSIONS.MANAGE_USERS },
      { id: 'billing', permission: PERMISSIONS.VIEW_FEE_BALANCE },
      { id: 'system-health', permission: null }
    ];

    return allMenuItems.filter(item => {
      if (!item.permission) return true; // Items without permission requirements are always visible
      return this.hasPermission(item.permission);
    });
  }
}

// Utility function to create a permission manager for a user
export const createPermissionManager = (
  userRole: UserRole, 
  userSchoolId?: string, 
  userClassIds?: string[]
): PermissionManager => {
  return new PermissionManager(userRole, userSchoolId, userClassIds || []);
};

// Hook for using permissions in React components
export const usePermissions = (userRole: UserRole, userSchoolId?: string, userClassIds: string[] = []) => {
  const permissionManager = new PermissionManager(userRole, userSchoolId, userClassIds);
  
  return {
    hasPermission: (permission: PermissionKey) => permissionManager.hasPermission(permission),
    getPermissionScope: (permission: PermissionKey) => permissionManager.getPermissionScope(permission),
    canAccessSchool: (schoolId: string) => permissionManager.canAccessSchool(schoolId),
    canAccessClass: (classId: string) => permissionManager.canAccessClass(classId),
    canAccessStudent: (studentId: string, studentSchoolId?: string) => 
      permissionManager.canAccessStudent(studentId, studentSchoolId),
    getFilteredMenuItems: () => permissionManager.getFilteredMenuItems()
  };
};
