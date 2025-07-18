import React, { useState } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Shield,
  Database,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthenticationTest: React.FC = () => {
  const { user, adminUser, isLoading, error, signIn, signOut } =
    useAdminAuthContext();
  const [testResults, setTestResults] = useState<{
    authState: boolean;
    adminUserFetch: boolean;
    databaseConnection: boolean;
    roleValidation: boolean;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runAuthenticationTests = async () => {
    setIsTesting(true);
    const results = {
      authState: false,
      adminUserFetch: false,
      databaseConnection: false,
      roleValidation: false,
    };

    try {
      // Test 1: Authentication state
      results.authState = !isLoading && !error && !!user;

      // Test 2: Database connection
      const { data: dbData, error: dbError } = await supabase
        .from("company_details")
        .select("id")
        .limit(1);
      results.databaseConnection = !dbError;

      // Test 3: Admin user fetch
      if (user) {
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        results.adminUserFetch = !adminError && !!adminData;
      }

      // Test 4: Role validation
      if (adminUser) {
        results.roleValidation = [
          "super_admin",
          "edufam_admin",
          "support_hr",
          "software_engineer",
          "sales_marketing",
          "finance",
        ].includes(adminUser.role);
      }
    } catch (err) {
      console.error("Authentication test failed:", err);
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        PASS
      </Badge>
    ) : (
      <Badge variant="destructive">FAIL</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current State</span>
            <Button
              onClick={runAuthenticationTests}
              disabled={isTesting}
              size="sm"
            >
              {isTesting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Run Tests
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Loading State</span>
                <Badge variant={isLoading ? "secondary" : "default"}>
                  {isLoading ? "Loading" : "Ready"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">User Authenticated</span>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Admin User Found</span>
                <Badge variant={adminUser ? "default" : "secondary"}>
                  {adminUser ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Has Error</span>
                <Badge variant={error ? "destructive" : "default"}>
                  {error ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {user && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Email</span>
                  <span className="text-sm font-mono">{user.email}</span>
                </div>

                {adminUser && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admin Name</span>
                      <span className="text-sm font-mono">
                        {adminUser.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admin Role</span>
                      <Badge variant="outline">{adminUser.role}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Is Active</span>
                      <Badge
                        variant={adminUser.is_active ? "default" : "secondary"}
                      >
                        {adminUser.is_active ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {testResults && (
            <div className="space-y-3">
              <h4 className="font-medium">Test Results</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {getStatusIcon(testResults.authState)}
                    Authentication State
                  </span>
                  {getStatusBadge(testResults.authState)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {getStatusIcon(testResults.databaseConnection)}
                    Database Connection
                  </span>
                  {getStatusBadge(testResults.databaseConnection)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {getStatusIcon(testResults.adminUserFetch)}
                    Admin User Fetch
                  </span>
                  {getStatusBadge(testResults.adminUserFetch)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    {getStatusIcon(testResults.roleValidation)}
                    Role Validation
                  </span>
                  {getStatusBadge(testResults.roleValidation)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {user ? (
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                size="sm"
              >
                Go to Login
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationTest;
