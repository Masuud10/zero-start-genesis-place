import { UserRole } from '@/types/user';

export interface Permission {
  resource: string;
  action: string;
  scope?: 'own' | 'school' | 'class' | 'all' | 'child';
}

export const PERMISSIONS = {
  // Enhanced Gradebook permissions with workflow control
  VIEW_GRADEBOOK: 'view_gradebook',
  EDIT_GRADEBOOK: 'edit_gradebook',
  SUBMIT_GRADES: 'submit_grades',
  APPROVE_GRADES: 'approve_grades',
  REJECT_GRADES: 'reject_grades',
  RELEASE_RESULTS: 'release_results',
  OVERRIDE_GRADES: 'override_grades',
  
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
  USE_AI_LEARNING: 'use_ai_learning',

  // Attendance permissions
  VIEW_ATTENDANCE: 'view_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',

  // Report permissions
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',

  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',

  // Support permissions
  ACCESS_SUPPORT: 'access_support',

  // Security permissions
  MANAGE_SECURITY: 'manage_security'
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission matrix based on the provided specification
export const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionKey, { allowed: boolean; scope?: string }>> = {
  edufam_admin: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false }, // Admins view only, don't edit
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: false },
    [PERMISSIONS.APPROVE_GRADES]: { allowed: false },
    [PERMISSIONS.REJECT_GRADES]: { allowed: false },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: false },
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: false },
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
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'all' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'all' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'all' }
  },

  school_owner: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false }, // School owners view summaries only
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: false },
    [PERMISSIONS.APPROVE_GRADES]: { allowed: false },
    [PERMISSIONS.REJECT_GRADES]: { allowed: false },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: false },
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: false },
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
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'school' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'school' }
  },

  principal: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'school' }, // Can edit for override purposes
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: false }, // Principals don't submit, they approve
    [PERMISSIONS.APPROVE_GRADES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.REJECT_GRADES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: true, scope: 'school' }, // EXCLUSIVE right to release
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: true, scope: 'school' },
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
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'school' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'school' }
  },

  teacher: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'class' },
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: true, scope: 'class' }, // Only draft/rejected grades
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: true, scope: 'class' },
    [PERMISSIONS.APPROVE_GRADES]: { allowed: false },
    [PERMISSIONS.REJECT_GRADES]: { allowed: false },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: false }, // Teachers CANNOT release
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: false }, // Teachers can request, not override
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
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'class' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'class' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'class' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'own' }
  },

  parent: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: true, scope: 'child' }, // Only released grades
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false },
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: false },
    [PERMISSIONS.APPROVE_GRADES]: { allowed: false },
    [PERMISSIONS.REJECT_GRADES]: { allowed: false },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: false },
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: false },
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
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: true, scope: 'child' },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'child' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: false },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'child' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'child' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'child' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'child' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'own' }
  },

  finance_officer: {
    [PERMISSIONS.VIEW_GRADEBOOK]: { allowed: false }, // Finance officers don't need grade access
    [PERMISSIONS.EDIT_GRADEBOOK]: { allowed: false },
    [PERMISSIONS.SUBMIT_GRADES]: { allowed: false },
    [PERMISSIONS.APPROVE_GRADES]: { allowed: false },
    [PERMISSIONS.REJECT_GRADES]: { allowed: false },
    [PERMISSIONS.RELEASE_RESULTS]: { allowed: false },
    [PERMISSIONS.OVERRIDE_GRADES]: { allowed: false },
    [PERMISSIONS.VIEW_POSITION]: { allowed: false },
    [PERMISSIONS.VIEW_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_FEE_BALANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.VIEW_ANNOUNCEMENTS]: { allowed: true, scope: 'school' },
    [PERMISSIONS.POST_ANNOUNCEMENTS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.VIEW_TIMETABLE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_TIMETABLE]: { allowed: false },
    [PERMISSIONS.VIEW_CLASS_INFO]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_CLASS_INFO]: { allowed: false },
    [PERMISSIONS.VIEW_OTHER_SCHOOLS]: { allowed: false },
    [PERMISSIONS.MANAGE_USERS]: { allowed: false },
    [PERMISSIONS.SEND_MESSAGES]: { allowed: true, scope: 'school' },
    [PERMISSIONS.SEND_PUSH_NOTIFICATIONS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.USE_AI_LEARNING]: { allowed: false },
    [PERMISSIONS.VIEW_ATTENDANCE]: { allowed: true, scope: 'school' },
    [PERMISSIONS.EDIT_ATTENDANCE]: { allowed: false },
    [PERMISSIONS.VIEW_REPORTS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.GENERATE_REPORTS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.VIEW_ANALYTICS]: { allowed: true, scope: 'finance' },
    [PERMISSIONS.ACCESS_SUPPORT]: { allowed: true, scope: 'school' },
    [PERMISSIONS.MANAGE_SECURITY]: { allowed: true, scope: 'own' }
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
    if (this.userRole === 'edufam_admin') {
      return true;
    }
    
    return this.userSchoolId === schoolId;
  }

  canAccessClass(classId: string): boolean {
    const scope = this.getPermissionScope(PERMISSIONS.VIEW_CLASS_INFO);
    
    if (scope === 'all') return true;
    if (scope === 'school') return true;
    if (scope === 'class') return this.userClassIds?.includes(classId) || false;
    
    return false;
  }

  canAccessStudent(studentId: string, studentSchoolId?: string): boolean {
    if (this.userRole === 'edufam_admin') {
      return true;
    }

    if (['school_owner', 'principal'].includes(this.userRole)) {
      return this.userSchoolId === studentSchoolId;
    }

    if (this.userRole === 'teacher') {
      return this.userSchoolId === studentSchoolId;
    }

    if (this.userRole === 'parent') {
      return false;
    }

    if (this.userRole === 'finance_officer') {
      return this.userSchoolId === studentSchoolId;
    }

    return false;
  }

  canModifySchoolData(targetSchoolId?: string): boolean {
    if (this.userRole === 'edufam_admin') {
      return true;
    }

    if (!targetSchoolId || !this.userSchoolId) {
      return false;
    }

    return this.userSchoolId === targetSchoolId;
  }

  getSchoolContext(): { schoolId?: string; isSystemAdmin: boolean } {
    return {
      schoolId: this.userSchoolId,
      isSystemAdmin: this.userRole === 'edufam_admin'
    };
  }

  getFilteredMenuItems() {
    const allMenuItems = [
      { id: 'dashboard', permission: null },
      { id: 'analytics', permission: PERMISSIONS.VIEW_ANALYTICS },
      { id: 'grades', permission: PERMISSIONS.VIEW_GRADEBOOK },
      { id: 'attendance', permission: PERMISSIONS.VIEW_ATTENDANCE },
      { id: 'students', permission: PERMISSIONS.VIEW_CLASS_INFO },
      { id: 'finance', permission: PERMISSIONS.VIEW_FEE_BALANCE },
      { id: 'timetable', permission: PERMISSIONS.VIEW_TIMETABLE },
      { id: 'announcements', permission: PERMISSIONS.VIEW_ANNOUNCEMENTS },
      { id: 'messages', permission: PERMISSIONS.SEND_MESSAGES },
      { id: 'reports', permission: PERMISSIONS.VIEW_REPORTS },
      { id: 'support', permission: PERMISSIONS.ACCESS_SUPPORT },
      { id: 'security', permission: PERMISSIONS.MANAGE_SECURITY },
      { id: 'settings', permission: null },
      { id: 'schools', permission: PERMISSIONS.VIEW_OTHER_SCHOOLS },
      { id: 'users', permission: PERMISSIONS.MANAGE_USERS },
      { id: 'billing', permission: PERMISSIONS.VIEW_FEE_BALANCE },
      { id: 'system-health', permission: null }
    ];

    return allMenuItems.filter(item => {
      if (!item.permission) return true;
      return this.hasPermission(item.permission);
    });
  }
}

export const createPermissionManager = (
  userRole: UserRole, 
  userSchoolId?: string, 
  userClassIds?: string[]
): PermissionManager => {
  return new PermissionManager(userRole, userSchoolId, userClassIds || []);
};

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
