import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/authService";
import { RouteGuard } from "@/utils/routeGuard";
import LoadingScreen from "@/components/common/LoadingScreen";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import DeactivatedAccountMessage from "@/components/auth/DeactivatedAccountMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, Building } from "lucide-react";

interface StrictRoleMiddlewareProps {
  children: React.ReactNode;
  requiredAccessType: "school" | "admin";
  fallback?: React.ReactNode;
}

export const StrictRoleMiddleware: React.FC<StrictRoleMiddlewareProps> = ({
  children,
  requiredAccessType,
  fallback,
}) => {
  const { user, isLoading, error } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      if (!user || isLoading) return;

      setIsValidating(true);
      setValidationError(null);

      try {
        // Validate user's role against the required access type
        const roleValidation = AuthService.validateRoleForAccessType(
          user.role,
          requiredAccessType
        );

        if (!roleValidation.isValid) {
          setValidationError(roleValidation.error || "Access denied");
          return;
        }

        // Additional validation: check if user account is active
        if (user.user_metadata?.status === "inactive") {
          setValidationError(
            "Your account has been deactivated. Please contact your administrator."
          );
          return;
        }

        // Check if user has a valid role
        if (!user.role) {
          setValidationError(
            "Your account role is not properly configured. Please contact your administrator."
          );
          return;
        }

        // For school users, ensure they have a school assignment
        if (
          requiredAccessType === "school" &&
          !user.school_id &&
          !AuthService.isEduFamAdmin(user.role)
        ) {
          setValidationError(
            "Your account needs to be assigned to a school. Please contact your administrator."
          );
          return;
        }
      } catch (error) {
        console.error("🔐 StrictRoleMiddleware: Validation error:", error);
        setValidationError("Access validation failed. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateAccess();
  }, [user, isLoading, requiredAccessType]);

  // Show loading while validating
  if (isLoading || isValidating) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (error) {
    if (error.includes("deactivated") || error.includes("inactive")) {
      return <DeactivatedAccountMessage />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">
                Authentication Error
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    window.location.href = "/login";
    return <LoadingScreen />;
  }

  // Handle validation errors
  if (validationError) {
    const isAdminAccess = requiredAccessType === "admin";
    const userRole = AuthService.getRoleDisplayName(user.role);
    const accessTypeName = isAdminAccess
      ? "EduFam Admin Staff"
      : "School Users";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="border-red-200 bg-red-50 max-w-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700">
              <p className="mb-2">{validationError}</p>
              <div className="bg-red-100 p-3 rounded text-xs">
                <p>
                  <strong>Your Role:</strong> {userRole}
                </p>
                <p>
                  <strong>Required Access:</strong> {accessTypeName}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Go to Login
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Go Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
};

// Higher-order component for easier usage
export const withStrictRoleValidation = <P extends object>(
  Component: React.ComponentType<P>,
  requiredAccessType: "school" | "admin"
) => {
  const WrappedComponent = (props: P) => (
    <StrictRoleMiddleware requiredAccessType={requiredAccessType}>
      <Component {...props} />
    </StrictRoleMiddleware>
  );

  WrappedComponent.displayName = `withStrictRoleValidation(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

// Hook for programmatic access validation
export const useStrictRoleValidation = (
  requiredAccessType: "school" | "admin"
) => {
  const { user } = useAuth();

  const validateAccess = () => {
    if (!user) return { hasAccess: false, error: "Authentication required" };

    const roleValidation = AuthService.validateRoleForAccessType(
      user.role,
      requiredAccessType
    );
    if (!roleValidation.isValid) {
      return { hasAccess: false, error: roleValidation.error };
    }

    return { hasAccess: true };
  };

  return {
    hasAccess: validateAccess().hasAccess,
    error: validateAccess().error,
    user,
  };
};
