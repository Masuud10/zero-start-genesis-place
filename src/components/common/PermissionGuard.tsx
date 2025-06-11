
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PermissionKey } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: PermissionKey;
  fallback?: React.ReactNode;
  requiredScope?: string;
  schoolId?: string;
  classId?: string;
  studentId?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback,
  requiredScope,
  schoolId,
  classId,
  studentId
}) => {
  const { user } = useAuth();
  const { hasPermission, getPermissionScope, canAccessSchool, canAccessClass, canAccessStudent } = usePermissions(
    user?.role as UserRole,
    user?.school_id
  );

  // Check if user has the required permission
  if (!hasPermission(permission)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  // Check scope-specific access
  const userScope = getPermissionScope(permission);

  // Check school access if required
  if (schoolId && !canAccessSchool(schoolId)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this school's data.
        </AlertDescription>
      </Alert>
    );
  }

  // Check class access if required
  if (classId && !canAccessClass(classId)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this class's data.
        </AlertDescription>
      </Alert>
    );
  }

  // Check student access if required
  if (studentId && !canAccessStudent(studentId, schoolId)) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this student's data.
        </AlertDescription>
      </Alert>
    );
  }

  // Check required scope
  if (requiredScope && userScope !== requiredScope && userScope !== 'all') {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have the required access scope for this feature.
        </AlertDescription>
      </Alert>
    );
  }

  // All permission checks passed, render children
  return <>{children}</>;
};

export default PermissionGuard;
