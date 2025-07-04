import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Activity,
  Database,
  Shield,
  Users,
  BarChart3,
  CreditCard,
  FileText,
  Headphones,
  Settings,
  Clock,
  Zap,
} from "lucide-react";
import {
  useEduFamDashboardDebugger,
  DashboardDebugInfo,
} from "@/utils/debugEduFamDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";

const EduFamDashboardDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DashboardDebugInfo | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const { user } = useAuth();
  const { schoolId, isReady } = useSchoolScopedData();
  const {
    runFullDiagnostic,
    debugAuth,
    debugSchoolContext,
    getReport,
    exportData,
  } = useEduFamDashboardDebugger();
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log("🔍 Starting comprehensive EduFam Dashboard diagnostic...");

      // Run authentication debug
      if (user) {
        await debugAuth(user);
      }

      // Run school context debug
      await debugSchoolContext(schoolId, isReady);

      // Run full diagnostic
      const report = await runFullDiagnostic();
      setDebugInfo(report);
      setLastRun(new Date());

      toast({
        title: "Diagnostic Complete",
        description: "Dashboard diagnostic has been completed successfully.",
      });

      console.log("✅ Diagnostic completed:", report);
    } catch (error: any) {
      console.error("❌ Diagnostic failed:", error);
      toast({
        title: "Diagnostic Failed",
        description: error.message || "An error occurred during diagnostic.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportDebugReport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edufam-dashboard-debug-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Exported",
        description: "Debug report has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export debug report.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "loaded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "loading":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "loaded":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "loading":
        return <Badge variant="secondary">Loading</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!debugInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            EduFam Dashboard Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bug className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No diagnostic data available
            </h3>
            <p className="text-gray-600 mb-4">
              Run a comprehensive diagnostic to identify and fix dashboard
              issues.
            </p>
            <Button onClick={runDiagnostic} disabled={isRunning}>
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostic...
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 mr-2" />
                  Run Diagnostic
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              EduFam Dashboard Debugger
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={runDiagnostic}
                disabled={isRunning}
                variant="outline"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-run
                  </>
                )}
              </Button>
              <Button onClick={exportDebugReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
          {lastRun && (
            <p className="text-sm text-gray-500">
              Last run: {lastRun.toLocaleString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Main Debug Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Authentication Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusIcon(debugInfo.authentication.status)}
                  {getStatusBadge(debugInfo.authentication.status)}
                </div>
                {debugInfo.authentication.userRole && (
                  <p className="text-xs text-gray-500 mt-1">
                    Role: {debugInfo.authentication.userRole}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusIcon(debugInfo.database.status)}
                  {getStatusBadge(debugInfo.database.status)}
                </div>
                {debugInfo.database.lastQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last query:{" "}
                    {debugInfo.database.lastQuery.toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs">
                    Queries: {debugInfo.performance.queryCount}
                  </p>
                  <p className="text-xs">
                    Avg Time:{" "}
                    {debugInfo.performance.averageQueryTime.toFixed(0)}ms
                  </p>
                  <p className="text-xs">
                    Slow Queries: {debugInfo.performance.slowQueries.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs">Total: {debugInfo.errors.length}</p>
                  <p className="text-xs">
                    Auth:{" "}
                    {debugInfo.errors.filter((e) => e.type === "auth").length}
                  </p>
                  <p className="text-xs">
                    DB:{" "}
                    {
                      debugInfo.errors.filter((e) => e.type === "database")
                        .length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(debugInfo.permissions).map(
                  ([permission, hasAccess]) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 text-sm"
                    >
                      {hasAccess ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">
                        {permission.replace("canAccess", "").toLowerCase()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-mono">
                        {debugInfo.authentication.status}
                      </span>
                    </div>
                    {debugInfo.authentication.userId && (
                      <div className="flex justify-between">
                        <span>User ID:</span>
                        <span className="font-mono text-xs">
                          {debugInfo.authentication.userId}
                        </span>
                      </div>
                    )}
                    {debugInfo.authentication.userEmail && (
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-mono">
                          {debugInfo.authentication.userEmail}
                        </span>
                      </div>
                    )}
                    {debugInfo.authentication.userRole && (
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <span className="font-mono">
                          {debugInfo.authentication.userRole}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">School Context</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-mono">
                        {debugInfo.schoolContext.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ready:</span>
                      <span className="font-mono">
                        {debugInfo.schoolContext.isReady ? "Yes" : "No"}
                      </span>
                    </div>
                    {debugInfo.schoolContext.schoolId && (
                      <div className="flex justify-between">
                        <span>School ID:</span>
                        <span className="font-mono text-xs">
                          {debugInfo.schoolContext.schoolId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {(debugInfo.authentication.errors?.length ||
                debugInfo.schoolContext.errors?.length) && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                  <div className="space-y-1">
                    {debugInfo.authentication.errors?.map((error, index) => (
                      <Alert key={`auth-${index}`} variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ))}
                    {debugInfo.schoolContext.errors?.map((error, index) => (
                      <Alert key={`school-${index}`} variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Connection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-mono">
                        {debugInfo.database.status}
                      </span>
                    </div>
                    {debugInfo.database.lastQuery && (
                      <div className="flex justify-between">
                        <span>Last Query:</span>
                        <span className="font-mono">
                          {debugInfo.database.lastQuery.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Query Count:</span>
                      <span className="font-mono">
                        {debugInfo.performance.queryCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time:</span>
                      <span className="font-mono">
                        {debugInfo.performance.averageQueryTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slow Queries:</span>
                      <span className="font-mono">
                        {debugInfo.performance.slowQueries.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Errors */}
              {debugInfo.database.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">
                    Database Errors
                  </h4>
                  <div className="space-y-1">
                    {debugInfo.database.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Slow Queries */}
              {debugInfo.database.slowQueries.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-600">
                    Slow Queries
                  </h4>
                  <div className="space-y-1">
                    {debugInfo.database.slowQueries.map((query, index) => (
                      <div
                        key={index}
                        className="text-sm bg-orange-50 p-2 rounded border border-orange-200"
                      >
                        {query}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Component Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(debugInfo.components).map(
                  ([component, status]) => (
                    <div
                      key={component}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {getComponentIcon(component)}
                        <span className="capitalize">{component}</span>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {debugInfo.performance.queryCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Queries</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {debugInfo.performance.averageQueryTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Query Time
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {debugInfo.performance.slowQueries.length}
                  </div>
                  <div className="text-sm text-gray-600">Slow Queries</div>
                </div>
              </div>

              {debugInfo.performance.slowQueries.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Slow Query Details</h4>
                  <div className="space-y-2">
                    {debugInfo.performance.slowQueries.map((query, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <span className="font-mono text-sm">{query.query}</span>
                        <Badge variant="outline" className="text-orange-600">
                          {query.duration}ms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo.performance.memoryUsage && (
                <div>
                  <h4 className="font-medium mb-2">Memory Usage</h4>
                  <div className="text-sm">
                    <span className="font-mono">
                      {debugInfo.performance.memoryUsage.toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.errors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-600">No errors detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debugInfo.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTitle className="flex items-center gap-2">
                        <span className="capitalize">{error.type}</span>
                        <span className="text-xs text-gray-400">
                          {error.timestamp.toLocaleString()}
                        </span>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="space-y-1">
                          <p>{error.message}</p>
                          <p className="text-xs text-gray-400">
                            Context: {error.context}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const getComponentIcon = (component: string) => {
  switch (component) {
    case "stats":
      return <Activity className="h-4 w-4" />;
    case "schools":
      return <Users className="h-4 w-4" />;
    case "users":
      return <Users className="h-4 w-4" />;
    case "analytics":
      return <BarChart3 className="h-4 w-4" />;
    case "billing":
      return <CreditCard className="h-4 w-4" />;
    case "reports":
      return <FileText className="h-4 w-4" />;
    case "support":
      return <Headphones className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

export default EduFamDashboardDebugger;
