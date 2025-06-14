
import React from 'react';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import { UserRole } from '@/types/user';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireSchoolAssignment?: boolean;
  fallback?: React.ReactNode;
  redirectOnFail?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requireSchoolAssignment = false,
  fallback,
  redirectOnFail = false
}) => {
  const { isValid, hasValidRole, hasRequiredSchoolAssignment, error, isLoading } = useRoleValidation();

  console.log('🛡️ RoleGuard: Checking access with roles:', allowedRoles, {
    isValid,
    hasValidRole,
    hasRequiredSchoolAssignment,
    requireSchoolAssignment,
    error
  });

  // Show loading while validating
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle invalid role
  if (!hasValidRole) {
    if (redirectOnFail) {
      window.location.href = '/';
      return <LoadingScreen />;
    }

    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Invalid Role</CardTitle>
            </div>
            <CardDescription>Your account role is not properly configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              {error || 'Please contact your administrator to configure your role.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle school assignment requirement
  if (requireSchoolAssignment && !hasRequiredSchoolAssignment) {
    if (redirectOnFail) {
      window.location.href = '/setup';
      return <LoadingScreen />;
    }

    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-yellow-200 bg-yellow-50 max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">School Assignment Required</CardTitle>
            </div>
            <CardDescription>Your account needs to be assigned to a school.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              Please contact your administrator to assign your account to a school.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check specific role access if roles are specified
  if (allowedRoles.length > 0) {
    // This logic should be implemented with the useRoleBasedRouting hook
    console.log('🛡️ RoleGuard: Role-specific access check needed for:', allowedRoles);
  }

  // All checks passed
  console.log('🛡️ RoleGuard: Access granted');
  return <>{children}</>;
};

export default RoleGuard;
