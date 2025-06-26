import { UserRole } from '@/types/user';

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  edufam_admin: ['*'], // Full access
  elimisha_admin: ['*'], // Mirror edufam_admin
  principal: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  teacher: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  school_owner: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  finance_officer: ['dashboard', 'analytics', 'finance', 'students', 'reports', 'announcements', 'messages', 'attendance', 'timetable', 'support'],
  parent: ['dashboard', 'grades', 'attendance', 'finance', 'timetable', 'announcements', 'messages', 'support']
};

export const hasAccess = (userRole: UserRole | undefined, section: string): boolean => {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  // Admin roles have full access
  if (permissions.includes('*')) return true;
  
  // Security section is ONLY accessible to edufam_admin
  if (section === 'security') {
    return userRole === 'edufam_admin';
  }
  
  // Reports section restrictions for teachers
  if (section === 'reports') {
    if (userRole === 'teacher') {
      // Teachers can access reports but with restrictions
      return true;
    }
    return permissions.includes(section);
  }
  
  // Check if the section is in the role's permissions
  return permissions.includes(section);
};

export const canAccessModule = (userRole: UserRole | undefined, module: string): boolean => {
  return hasAccess(userRole, module);
};

export const canAccessReportType = (userRole: UserRole | undefined, reportType: string): boolean => {
  if (!userRole) return false;
  
  // Admin roles have full access
  if (userRole === 'edufam_admin') return true;
  
  // Teachers can only access grade and attendance reports
  if (userRole === 'teacher') {
    return ['grades', 'attendance', 'grade_report', 'attendance_report'].includes(reportType);
  }
  
  // Other roles have different permissions
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  return permissions.includes('reports');
};

export const getAccessibleSections = (userRole: UserRole | undefined): string[] => {
  if (!userRole) return [];
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return [];
  
  // If admin, return all sections
  if (permissions.includes('*')) {
    return ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support', 'settings', 'schools', 'users', 'billing', 'system-health', 'security'];
  }
  
  return [...permissions];
};
