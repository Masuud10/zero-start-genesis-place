import { UserRole } from '@/types/user';

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  edufam_admin: ['*'], // Full access
  elimisha_admin: ['*'], // Mirror edufam_admin
  principal: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  teacher: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'timetable', 'announcements', 'messages', 'reports'],
  school_owner: ['dashboard', 'analytics', 'finance', 'announcements', 'messages', 'reports'],
  finance_officer: ['dashboard', 'analytics', 'finance', 'announcements', 'messages', 'reports'],
  parent: ['dashboard', 'grades', 'attendance', 'finance', 'announcements', 'messages']
};

export const hasAccess = (userRole: UserRole | undefined, section: string): boolean => {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  // Admin roles have full access
  if (permissions.includes('*')) return true;
  
  // Check if the section is in the role's permissions
  return permissions.includes(section);
};

export const canAccessModule = (userRole: UserRole | undefined, module: string): boolean => {
  return hasAccess(userRole, module);
};

export const getAccessibleSections = (userRole: UserRole | undefined): string[] => {
  if (!userRole) return [];
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return [];
  
  // If admin, return all sections
  if (permissions.includes('*')) {
    return ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support', 'settings', 'schools', 'users', 'billing', 'system-health'];
  }
  
  return [...permissions];
};
