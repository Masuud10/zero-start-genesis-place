
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { useCallback } from 'react';

export const useAccessControl = () => {
  const { user } = useAuth();
  
  const { hasPermission } = usePermissions(
    user?.role as UserRole,
    user?.school_id
  );

  const checkAccess = useCallback((section: string): boolean => {
    if (!user?.role) {
      console.log('🔒 useAccessControl: No user role found');
      return false;
    }

    console.log('🔒 useAccessControl: Checking access for section:', section, 'user role:', user.role);

    if (section === 'dashboard') return true;

    switch (section) {
      case 'school-management':
        // Only principals should have access to school management
        const hasSchoolManagementAccess = user.role === 'principal';
        console.log('🔒 useAccessControl: School management access:', hasSchoolManagementAccess);
        return hasSchoolManagementAccess;
      case 'certificates':
        // Principals, school owners, and EduFam admins can access certificates
        return user.role === 'principal' || user.role === 'school_owner' || user.role === 'edufam_admin';
      case 'grades':
        return hasPermission(PERMISSIONS.VIEW_GRADEBOOK);
      case 'attendance':
        return hasPermission(PERMISSIONS.VIEW_ATTENDANCE);
      case 'students':
        return hasPermission(PERMISSIONS.VIEW_CLASS_INFO);
      case 'finance':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE);
      case 'timetable':
        return hasPermission(PERMISSIONS.VIEW_TIMETABLE);
      case 'announcements':
        return hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS);
      case 'messages':
        return hasPermission(PERMISSIONS.SEND_MESSAGES);
      case 'reports':
        return hasPermission(PERMISSIONS.VIEW_REPORTS);
      case 'analytics':
        return hasPermission(PERMISSIONS.VIEW_ANALYTICS);
      case 'schools':
        return hasPermission(PERMISSIONS.VIEW_OTHER_SCHOOLS);
      case 'users':
        return hasPermission(PERMISSIONS.MANAGE_USERS);
      case 'billing':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE) || user.role === 'edufam_admin';
      case 'system-health':
        return user.role === 'edufam_admin';
      case 'settings':
        return user.role === 'edufam_admin';
      case 'security':
        return hasPermission(PERMISSIONS.MANAGE_SECURITY);
      case 'support':
        return hasPermission(PERMISSIONS.ACCESS_SUPPORT);
      default:
        console.log('🔒 useAccessControl: Unknown section:', section);
        return false;
    }
  }, [user, hasPermission]);

  return { checkAccess, user };
};
