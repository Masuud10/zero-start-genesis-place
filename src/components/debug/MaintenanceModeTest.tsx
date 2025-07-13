import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMaintenanceGate } from "@/hooks/useMaintenanceGate";

const MaintenanceModeTest: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, isBlocked } = useMaintenanceGate();
  const [testResult, setTestResult] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);

  const testMaintenanceMode = async () => {
    setIsTesting(true);
    setTestResult("Testing...");

    try {
      // Test 1: Check current maintenance status
      const { data: settings, error: settingsError } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (settingsError) {
        setTestResult(`❌ Error fetching settings: ${settingsError.message}`);
        return;
      }

      const maintenanceEnabled =
        (settings.setting_value as { enabled?: boolean })?.enabled === true;

      // Test 2: Check user session and profile
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setTestResult(`❌ Error fetching session: ${sessionError.message}`);
        return;
      }

      let userRole: string | null = null;
      let isAdmin = false;

      if (session?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          setTestResult(`❌ Error fetching profile: ${profileError.message}`);
          return;
        }

        userRole = profile?.role || null;
        isAdmin = userRole === "edufam_admin";
      }

      // Test 3: Verify gatekeeper logic
      const shouldBeBlocked = maintenanceEnabled && !isAdmin;
      const gatekeeperBlocked = isBlocked;

      const testPassed = shouldBeBlocked === gatekeeperBlocked;

      setTestResult(`
🔍 Maintenance Mode Test Results:

📊 Database State:
- Maintenance Mode: ${maintenanceEnabled ? "ENABLED" : "DISABLED"}
- User Role: ${userRole || "None"}
- Is Admin: ${isAdmin ? "YES" : "NO"}

🔐 Gatekeeper State:
- Is Loading: ${isLoading}
- Is Blocked: ${gatekeeperBlocked}
- Should Be Blocked: ${shouldBeBlocked}

✅ Test Result: ${testPassed ? "PASSED" : "FAILED"}
${
  !testPassed
    ? "❌ Gatekeeper logic mismatch detected!"
    : "🎉 All systems working correctly!"
}
      `);
    } catch (error) {
      setTestResult(`❌ Test failed with error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    try {
      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: { enabled, message: "Test maintenance mode" },
        description: "Test maintenance mode configuration",
      });

      if (error) {
        setTestResult(`❌ Error toggling maintenance mode: ${error.message}`);
      } else {
        setTestResult(
          `✅ Maintenance mode ${enabled ? "enabled" : "disabled"} successfully`
        );
        // Refresh the page to test the gatekeeper
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  if (!user || user.role !== "edufam_admin") {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6">
          <p className="text-center text-gray-600">
            This test is only available to EduFam Administrators.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Maintenance Mode Test Panel
            <Badge variant={isBlocked ? "destructive" : "default"}>
              {isBlocked ? "BLOCKED" : "ALLOWED"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => toggleMaintenanceMode(true)}
              variant="destructive"
              disabled={isTesting}
            >
              Enable Maintenance Mode
            </Button>
            <Button
              onClick={() => toggleMaintenanceMode(false)}
              variant="default"
              disabled={isTesting}
            >
              Disable Maintenance Mode
            </Button>
          </div>

          <Button
            onClick={testMaintenanceMode}
            variant="outline"
            className="w-full"
            disabled={isTesting}
          >
            {isTesting ? "Running Test..." : "Run Diagnostic Test"}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceModeTest;
