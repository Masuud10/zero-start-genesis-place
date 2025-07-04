import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { DatabaseConnectionTest } from "@/utils/databaseConnectionTest";

interface TestResult {
  connected: boolean;
  error?: string;
  details: {
    basicConnection: boolean;
    profilesTable: boolean;
    schoolsTable: boolean;
    systemStatusTable: boolean;
    responseTime: number;
  };
}

const DatabaseConnectionDebugger: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const result = await DatabaseConnectionTest.runFullTest();
      setTestResult(result);
      setLastRun(new Date());
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult({
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          basicConnection: false,
          profilesTable: false,
          schoolsTable: false,
          systemStatusTable: false,
          responseTime: 0,
        },
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "Connected" : "Failed"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Test database connectivity and table access
              </p>
              {lastRun && (
                <p className="text-xs text-muted-foreground">
                  Last run: {lastRun.toLocaleString()}
                </p>
              )}
            </div>
            <Button
              onClick={runTest}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
              />
              {isRunning ? "Testing..." : "Run Test"}
            </Button>
          </div>

          {testResult && (
            <div className="space-y-4">
              {/* Overall Status */}
              <Alert variant={testResult.connected ? "default" : "destructive"}>
                {testResult.connected ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>Overall Status:</strong>{" "}
                  {getStatusBadge(testResult.connected)}
                  {testResult.error && (
                    <div className="mt-2 text-sm">
                      <strong>Error:</strong> {testResult.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResult.details.basicConnection)}
                      Basic Connection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tests basic database connectivity
                    </p>
                    {getStatusBadge(testResult.details.basicConnection)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResult.details.profilesTable)}
                      Profiles Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tests access to profiles table
                    </p>
                    {getStatusBadge(testResult.details.profilesTable)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResult.details.schoolsTable)}
                      Schools Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tests access to schools table
                    </p>
                    {getStatusBadge(testResult.details.schoolsTable)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(testResult.details.systemStatusTable)}
                      System Status Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Tests access to system_status table
                    </p>
                    {getStatusBadge(testResult.details.systemStatusTable)}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Response Time:
                    </span>
                    <Badge
                      variant={
                        testResult.details.responseTime < 1000
                          ? "default"
                          : "secondary"
                      }
                    >
                      {testResult.details.responseTime}ms
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConnectionDebugger;
