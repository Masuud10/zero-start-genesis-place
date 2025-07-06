import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchool } from "@/contexts/SchoolContext";
import { SupabaseClient } from "@supabase/supabase-js";

interface RealtimeMetrics {
  activeUsers: number;
  recentGrades: number;
  recentAttendance: number;
  recentPayments: number;
  systemAlerts: number;
  lastUpdated: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user_name?: string;
  school_name?: string;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_category: string;
  timestamp: string;
  metadata?: {
    subject_name?: string;
    class_name?: string;
    amount?: string;
  };
  profiles?: {
    name: string;
  }[];
  schools?: {
    name: string;
  }[];
}

interface DatabaseActivity {
  id: string;
  event_type: string;
  event_category: string;
  timestamp: string;
  metadata?: {
    subject_name?: string;
    class_name?: string;
    amount?: string;
  };
  profiles?: {
    name: string;
  }[];
  schools?: {
    name: string;
  }[];
}

const RealtimeAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const [isRealtime, setIsRealtime] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time metrics query
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["realtime-metrics", currentSchool?.id, refreshKey],
    queryFn: async (): Promise<RealtimeMetrics> => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      try {
        // Get recent activities based on user role with type assertion
        let baseQuery = (supabase as SupabaseClient)
          .from("analytics_events")
          .select("*");

        if (user?.role !== "elimisha_admin" && user?.role !== "edufam_admin") {
          baseQuery = baseQuery.eq(
            "school_id",
            currentSchool?.id || user?.school_id
          );
        }

        const { data: recentEvents } = await baseQuery
          .gte("timestamp", oneHourAgo.toISOString())
          .order("timestamp", { ascending: false });

        // Calculate metrics from recent events
        const events = recentEvents || [];

        return {
          activeUsers: Math.floor(Math.random() * 25) + 5, // Mock active users
          recentGrades: events.filter(
            (e: AnalyticsEvent) => e.event_category === "grades"
          ).length,
          recentAttendance: events.filter(
            (e: AnalyticsEvent) => e.event_category === "attendance"
          ).length,
          recentPayments: events.filter(
            (e: AnalyticsEvent) => e.event_category === "finance"
          ).length,
          systemAlerts: Math.floor(Math.random() * 3), // Mock alerts
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Failed to fetch realtime metrics:", error);
        return {
          activeUsers: 0,
          recentGrades: 0,
          recentAttendance: 0,
          recentPayments: 0,
          systemAlerts: 0,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    refetchInterval: isRealtime ? 10000 : false, // Refresh every 10 seconds if realtime is enabled
    staleTime: 5000,
  });

  // Recent activities query
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities", currentSchool?.id, refreshKey],
    queryFn: async (): Promise<RecentActivity[]> => {
      try {
        let query = (supabase as SupabaseClient).from("analytics_events")
          .select(`
            id,
            event_type,
            event_category,
            timestamp,
            metadata,
            profiles!analytics_events_user_id_fkey(name),
            schools!analytics_events_school_id_fkey(name)
          `);

        if (user?.role !== "elimisha_admin" && user?.role !== "edufam_admin") {
          query = query.eq("school_id", currentSchool?.id || user?.school_id);
        }

        const { data } = await query
          .order("timestamp", { ascending: false })
          .limit(10);

        return (data || []).map((activity: DatabaseActivity) => ({
          id: activity.id,
          type: activity.event_category,
          description: formatActivityDescription(activity),
          timestamp: activity.timestamp,
          user_name: activity.profiles?.[0]?.name,
          school_name: activity.schools?.[0]?.name,
        }));
      } catch (error) {
        console.error("Failed to fetch recent activities:", error);
        return [];
      }
    },
    refetchInterval: isRealtime ? 15000 : false,
  });

  const formatActivityDescription = (activity: DatabaseActivity): string => {
    switch (activity.event_category) {
      case "grades":
        return `Grade submitted for ${
          activity.metadata?.subject_name || "subject"
        }`;
      case "attendance":
        return `Attendance marked for ${
          activity.metadata?.class_name || "class"
        }`;
      case "finance":
        return `Payment of ${
          activity.metadata?.amount || "unknown amount"
        } processed`;
      case "user_activity":
        return `User ${activity.event_type.replace("_", " ")}`;
      default:
        return `${activity.event_type.replace("_", " ")}`;
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const toggleRealtime = () => {
    setIsRealtime(!isRealtime);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-time Analytics</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealtime}
            className={isRealtime ? "bg-green-50 border-green-200" : ""}
          >
            <Activity
              className={`h-4 w-4 mr-2 ${isRealtime ? "text-green-600" : ""}`}
            />
            {isRealtime ? "Real-time ON" : "Real-time OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metrics?.activeUsers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Recent Grades</p>
                <p className="text-2xl font-bold text-green-700">
                  {metrics?.recentGrades || 0}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Attendance</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {metrics?.recentAttendance || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Payments</p>
                <p className="text-2xl font-bold text-purple-700">
                  {metrics?.recentPayments || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Alerts</p>
                <p className="text-2xl font-bold text-red-700">
                  {metrics?.systemAlerts || 0}
                </p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activities
            </span>
            {metrics?.lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities?.length ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {activity.user_name && (
                        <span>by {activity.user_name}</span>
                      )}
                      {activity.school_name &&
                        user?.role === "elimisha_admin" && (
                          <span>• {activity.school_name}</span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeAnalytics;
