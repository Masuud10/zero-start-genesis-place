import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bug,
  Database,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface DebugInfo {
  timestamp: string;
  status: "healthy" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

const DebugDashboard: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<DebugInfo[]>([
    {
      timestamp: new Date().toISOString(),
      status: "healthy",
      message: "Application loaded successfully",
    },
    {
      timestamp: new Date().toISOString(),
      status: "healthy",
      message: "Database connection established",
    },
    {
      timestamp: new Date().toISOString(),
      status: "warning",
      message: "Some components may have missing dependencies",
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Bug className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          <p className="text-muted-foreground">
            System diagnostics and debugging information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Connected</div>
            <p className="text-xs text-muted-foreground">
              Supabase connection active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Warning</div>
            <p className="text-xs text-muted-foreground">
              Some missing dependencies
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Log</CardTitle>
          <CardDescription>
            Recent system events and diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugInfo.map((info, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(info.status)}
                  <div>
                    <p className="font-medium">{info.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(info.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(info.status)}>
                  {info.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Bug className="h-4 w-4" />
        <AlertDescription>
          This debug dashboard shows system status and diagnostic information.
          Use this to troubleshoot any issues with the application.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DebugDashboard;
