
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireSchoolAssignment?: boolean;
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireSchoolAssignment = false,
  fallbackMessage = "You don't have permission to access this page."
}) => {
  const { user, isLoading, error } = useAuth();

  console.log('🔒 ProtectedRoute: Checking access for:', {
    userRole: user?.role,
    allowedRoles,
    requireSchoolAssignment,
    userSchoolId: user?.school_id,
    isLoading
  });

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>There was a problem with your authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log('🔒 ProtectedRoute: No user found, redirecting to login');
    window.location.href = '/';
    return <LoadingScreen />;
  }

  // Check if user has valid role
  if (!user.role) {
    console.error('🔒 ProtectedRoute: User has no role assigned');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Role Configuration Error</CardTitle>
            <CardDescription>Your account role is missing and needs to be configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              Please contact your administrator to assign a role to your account.
            </p>
            <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
              User ID: {user.id?.slice(0, 8)}...<br />
              Email: {user.email}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    console.log('🔒 ProtectedRoute: Role not allowed:', user.role, 'Required:', allowedRoles);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fallbackMessage}
            <br />
            <span className="text-xs text-muted-foreground mt-2 block">
              Your role: {user.role} | Required: {allowedRoles.join(', ')}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check school assignment requirement
  if (requireSchoolAssignment && !user.school_id) {
    console.log('🔒 ProtectedRoute: School assignment required but missing for role:', user.role);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">School Assignment Required</CardTitle>
            <CardDescription>Your account needs to be assigned to a school.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              Please contact your administrator to assign your account to a school.
            </p>
            <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
              Role: {user.role}<br />
              User ID: {user.id?.slice(0, 8)}...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🔒 ProtectedRoute: Access granted for role:', user.role);
  
  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
