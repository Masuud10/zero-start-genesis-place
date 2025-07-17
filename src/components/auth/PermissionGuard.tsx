import React from 'react';
import { useAdminAuthContext } from './AdminAuthProvider';
import { AdminRole } from '@/types/admin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: AdminRole | AdminRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If both permission and role are provided, require both to be true
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  role,
  fallback,
  requireAll = false,
}) => {
  const { hasPermission, isRole, adminUser } = useAdminAuthContext();

  // If no admin user, deny access
  if (!adminUser) {
    return fallback || (
      <Alert variant="destructive" className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Please sign in with proper admin credentials.
        </AlertDescription>
      </Alert>
    );
  }

  let hasAccess = true;

  // Check permission if provided
  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  // Check role if provided
  if (role && !isRole(role)) {
    if (requireAll || !permission) {
      hasAccess = false;
    } else if (permission && !requireAll) {
      // If we have permission but not role, and requireAll is false, allow access
      hasAccess = hasPermission(permission);
    }
  }

  // If both permission and role are provided and requireAll is true
  if (permission && role && requireAll) {
    hasAccess = hasPermission(permission) && isRole(role);
  }

  // If neither permission nor role is provided, allow access (guard is just for structure)
  if (!permission && !role) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback || (
      <Alert variant="destructive" className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You don't have the required permissions to access this feature.
          {role && ` Required role: ${Array.isArray(role) ? role.join(' or ') : role}`}
          {permission && ` Required permission: ${permission}`}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};