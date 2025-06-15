
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useSystemHealthStatus } from "@/hooks/useSystemHealthStatus";

const SystemHealthStatusCard: React.FC = () => {
  const { health, loading, error } = useSystemHealthStatus();

  let icon = <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
  let color = "bg-yellow-100 text-yellow-700";
  let label = "Loading...";

  if (error) {
    icon = <AlertTriangle className="w-5 h-5 text-red-600" />;
    color = "bg-red-100 text-red-700";
    label = "Status unknown";
  } else if (health) {
    if (health.supabase_connected && health.current_status === "healthy") {
      icon = <CheckCircle className="w-5 h-5 text-green-600" />;
      color = "bg-green-50 text-green-800";
      label = "Connected";
    } else {
      icon = <AlertTriangle className="w-5 h-5 text-red-600" />;
      color = "bg-red-100 text-red-700";
      label = "Connection Issue";
    }
  }

  return (
    <Card className={`mb-4 border-0 shadow-none`}>
      <CardHeader className="flex flex-row items-center gap-3 py-2 px-4">
        {icon}
        <CardTitle className="text-base font-semibold flex-grow">
          Supabase & System Health
        </CardTitle>
        <Badge className={color}>{label}</Badge>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Checking system health...</div>
        ) : error ? (
          <div className="text-xs text-red-700">{error}</div>
        ) : !health ? (
          <div className="text-xs text-muted-foreground">No health data available.</div>
        ) : (
          <div className="flex flex-col gap-1 text-sm">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span className={`inline-block font-semibold`}>
                {health.current_status}
              </span>
            </div>
            <div>
              <span className="font-medium">Uptime:</span>{" "}
              <span className="inline-block font-semibold text-green-700">
                {health.uptime_percent?.toFixed?.(2) ?? "?"}%
              </span>
            </div>
            <div>
              <span className="font-medium">Last Checked:</span>{" "}
              <span className="text-xs text-muted-foreground">
                {health.updated_at
                  ? new Date(health.updated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthStatusCard;

