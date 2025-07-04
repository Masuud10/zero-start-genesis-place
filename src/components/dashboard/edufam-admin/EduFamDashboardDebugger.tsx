import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  Bug,
  Database,
  Users,
  School,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Gauge,
  Server,
  Network,
  HardDrive,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSchool } from "../../../contexts/SchoolContext";
import { useSchoolScopedData } from "../../../hooks/useSchoolScopedData";
import { useAdminSchoolsData } from "../../../hooks/useAdminSchoolsData";
import { useAdminUsersData } from "../../../hooks/useAdminUsersData";
import { supabase } from "../../../integrations/supabase/client";
import PerformanceMonitor from "../../../utils/performanceMonitor";
import { ApiService } from "../../../services/api/apiService";

// Extend Performance interface for memory usage
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface DebugInfo {
  timestamp: string;
  auth: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      role: string;
      school_id: string;
    } | null;
    role: string | null;
    schoolId: string | null;
  };
  schoolContext: {
    currentSchool: {
      id: string;
      name: string;
      email: string;
    } | null;
    isLoading: boolean;
    isReady: boolean;
  };
  database: {
    isConnected: boolean;
    responseTime: number;
    error: string | null;
  };
  performance: {
    totalMetrics: number;
    averageQueryTime: number;
    averageRenderTime: number;
    slowQueries: Array<{ name: string; duration: number }>;
    slowRenders: Array<{ componentName: string; duration: number }>;
  };
  components: {
    schoolsData: {
      isLoading: boolean;
      error: string | null;
      dataCount: number;
    };
    usersData: {
      isLoading: boolean;
      error: string | null;
      dataCount: number;
    };
  };
  system: {
    memoryUsage: number;
    networkStatus: string;
    browserInfo: string;
    timestamp: string;
  };
}

const EduFamDashboardDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { user } = useAuth();
  const { currentSchool, isLoading: schoolLoading } = useSchool();
  const { isReady, schoolId } = useSchoolScopedData();
  const {
    data: schools,
    isLoading: schoolsLoading,
    error: schoolsError,
  } = useAdminSchoolsData();
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsersData();

  const collectDebugInfo = async (): Promise<DebugInfo> => {
    const startTime = Date.now();

    // Test database connection
    let dbResponseTime = 0;
    let dbError: string | null = null;
    let isConnected = false;

    try {
      const dbStart = Date.now();
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      dbResponseTime = Date.now() - dbStart;
      isConnected = !error;
      if (error) dbError = error.message;
    } catch (error) {
      dbError =
        error instanceof Error ? error.message : "Unknown database error";
    }

    // Get performance stats
    const perfStats = PerformanceMonitor.getStats();

    // Get system info
    const memoryUsage = (performance as ExtendedPerformance).memory
      ? (performance as ExtendedPerformance).memory!.usedJSHeapSize /
        1024 /
        1024
      : 0;
    const networkStatus = navigator.onLine ? "Online" : "Offline";
    const browserInfo = `${navigator.userAgent.split(" ").slice(-2).join(" ")}`;

    return {
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated: !!user,
        user: user
          ? {
              id: user.id,
              email: user.email,
              role: user.role,
              school_id: user.school_id,
            }
          : null,
        role: user?.role || null,
        schoolId: schoolId,
      },
      schoolContext: {
        currentSchool: currentSchool
          ? {
              id: currentSchool.id,
              name: currentSchool.name,
              email: currentSchool.email,
            }
          : null,
        isLoading: schoolLoading,
        isReady,
      },
      database: {
        isConnected,
        responseTime: dbResponseTime,
        error: dbError,
      },
      performance: {
        totalMetrics: perfStats.totalMetrics,
        averageQueryTime: perfStats.averageQueryTime,
        averageRenderTime: perfStats.averageRenderTime,
        slowQueries: perfStats.slowQueries.map((q) => ({
          name: q.name,
          duration: q.duration,
        })),
        slowRenders: perfStats.slowRenders.map((r) => ({
          componentName: r.componentName,
          duration: r.duration,
        })),
      },
      components: {
        schoolsData: {
          isLoading: schoolsLoading,
          error: schoolsError
            ? schoolsError instanceof Error
              ? schoolsError.message
              : String(schoolsError)
            : null,
          dataCount: schools?.length || 0,
        },
        usersData: {
          isLoading: usersLoading,
          error: usersError
            ? usersError instanceof Error
              ? usersError.message
              : String(usersError)
            : null,
          dataCount: users?.length || 0,
        },
      },
      system: {
        memoryUsage,
        networkStatus,
        browserInfo,
        timestamp: new Date().toISOString(),
      },
    };
  };

  const refreshDebugInfo = async () => {
    setIsLoading(true);
    try {
      const info = await collectDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error("Error collecting debug info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshDebugInfo, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge
        variant={status ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  if (!debugInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Dashboard Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Initializing debugger...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasErrors =
    debugInfo.database.error ||
    debugInfo.components.schoolsData.error ||
    debugInfo.components.usersData.error ||
    !debugInfo.auth.isAuthenticated ||
    !debugInfo.database.isConnected;

  const performanceIssues =
    debugInfo.performance.averageQueryTime > 1000 ||
    debugInfo.performance.averageRenderTime > 100 ||
    debugInfo.performance.slowQueries.length > 0 ||
    debugInfo.performance.slowRenders.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Dashboard Debugger
            {hasErrors && <AlertTriangle className="h-4 w-4 text-red-500" />}
            {performanceIssues && <Zap className="h-4 w-4 text-yellow-500" />}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshDebugInfo}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="h-4 w-4 mr-1" />
              Auto
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(debugInfo.timestamp).toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-sm font-medium">Database</div>
            {getStatusBadge(
              debugInfo.database.isConnected,
              debugInfo.database.isConnected ? "Connected" : "Error"
            )}
            {debugInfo.database.responseTime > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {debugInfo.database.responseTime}ms
              </div>
            )}
          </div>

          <div className="text-center p-3 border rounded-lg">
            <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">Authentication</div>
            {getStatusBadge(
              debugInfo.auth.isAuthenticated,
              debugInfo.auth.isAuthenticated ? "Authenticated" : "Not Auth"
            )}
            {debugInfo.auth.role && (
              <div className="text-xs text-gray-500 mt-1">
                {debugInfo.auth.role}
              </div>
            )}
          </div>

          <div className="text-center p-3 border rounded-lg">
            <School className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-sm font-medium">School Context</div>
            {getStatusBadge(
              debugInfo.schoolContext.isReady,
              debugInfo.schoolContext.isReady ? "Ready" : "Loading"
            )}
            {debugInfo.schoolContext.currentSchool && (
              <div className="text-xs text-gray-500 mt-1">
                {debugInfo.schoolContext.currentSchool.name}
              </div>
            )}
          </div>

          <div className="text-center p-3 border rounded-lg">
            <Activity className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium">Performance</div>
            {getStatusBadge(
              !performanceIssues,
              performanceIssues ? "Issues" : "Good"
            )}
            <div className="text-xs text-gray-500 mt-1">
              {debugInfo.performance.totalMetrics} metrics
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {debugInfo.database.error && (
                  <div>Database Error: {debugInfo.database.error}</div>
                )}
                {debugInfo.components.schoolsData.error &&
                debugInfo.components.schoolsData.error !== null &&
                typeof debugInfo.components.schoolsData.error === "object" &&
                "message" in (debugInfo.components.schoolsData.error as object)
                  ? (
                      debugInfo.components.schoolsData.error as {
                        message: string;
                      }
                    ).message
                  : debugInfo.components.schoolsData.error}
                {debugInfo.components.usersData.error &&
                debugInfo.components.usersData.error !== null &&
                typeof debugInfo.components.usersData.error === "object" &&
                "message" in (debugInfo.components.usersData.error as object)
                  ? (
                      debugInfo.components.usersData.error as {
                        message: string;
                      }
                    ).message
                  : debugInfo.components.usersData.error}
                {!debugInfo.auth.isAuthenticated && (
                  <div>Authentication Error: User not authenticated</div>
                )}
                {!debugInfo.database.isConnected && (
                  <div>Database Error: Unable to connect to database</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Performance Issues */}
        {performanceIssues && (
          <Alert variant="default" className="border-yellow-200 bg-yellow-50">
            <Zap className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-1">
                {debugInfo.performance.averageQueryTime > 1000 && (
                  <div>
                    Slow queries detected:{" "}
                    {debugInfo.performance.averageQueryTime.toFixed(2)}ms
                    average
                  </div>
                )}
                {debugInfo.performance.averageRenderTime > 100 && (
                  <div>
                    Slow renders detected:{" "}
                    {debugInfo.performance.averageRenderTime.toFixed(2)}ms
                    average
                  </div>
                )}
                {debugInfo.performance.slowQueries.length > 0 && (
                  <div>
                    {debugInfo.performance.slowQueries.length} slow queries
                    recorded
                  </div>
                )}
                {debugInfo.performance.slowRenders.length > 0 && (
                  <div>
                    {debugInfo.performance.slowRenders.length} slow renders
                    recorded
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Information */}
        {showDetails && (
          <div className="space-y-4">
            {/* Authentication Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Authentication Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.auth, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Database Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.database, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Performance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Performance Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium">Query Performance</div>
                    <div className="text-xs text-gray-500">
                      Average:{" "}
                      {debugInfo.performance.averageQueryTime.toFixed(2)}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      Slow queries: {debugInfo.performance.slowQueries.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Render Performance
                    </div>
                    <div className="text-xs text-gray-500">
                      Average:{" "}
                      {debugInfo.performance.averageRenderTime.toFixed(2)}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      Slow renders: {debugInfo.performance.slowRenders.length}
                    </div>
                  </div>
                </div>
                {debugInfo.performance.slowQueries.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">
                      Slow Queries:
                    </div>
                    <div className="space-y-1">
                      {debugInfo.performance.slowQueries
                        .slice(0, 5)
                        .map((query, index) => (
                          <div
                            key={index}
                            className="text-xs bg-red-50 p-2 rounded"
                          >
                            {query.name}: {query.duration.toFixed(2)}ms
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  System Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Memory Usage</div>
                    <div className="text-xs text-gray-500">
                      {debugInfo.system.memoryUsage.toFixed(2)} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Network</div>
                    <div className="text-xs text-gray-500">
                      {debugInfo.system.networkStatus}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium">Browser</div>
                    <div className="text-xs text-gray-500">
                      {debugInfo.system.browserInfo}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => PerformanceMonitor.clearMetrics()}
          >
            Clear Metrics
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const metrics = PerformanceMonitor.exportMetrics();
              console.log("Performance Metrics:", metrics);
            }}
          >
            Export Metrics
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log("Debug Info:", debugInfo);
            }}
          >
            Log to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EduFamDashboardDebugger;
