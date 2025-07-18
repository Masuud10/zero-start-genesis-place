import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SchoolHealthService } from "@/services/advancedFeaturesService";
import { SchoolHealthMetrics } from "@/types/advanced-features";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const SchoolHealthScoreWidget: React.FC = () => {
  const [schoolHealth, setSchoolHealth] = useState<SchoolHealthMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "green":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "yellow":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "red":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case "green":
        return "default" as const;
      case "yellow":
        return "secondary" as const;
      case "red":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const fetchSchoolHealth = async () => {
    try {
      setLoading(true);
      const response = await SchoolHealthService.getSchoolHealthMetrics();

      if (response.success) {
        setSchoolHealth(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch school health data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching school health:", error);
      toast({
        title: "Error",
        description: "Failed to fetch school health data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = async () => {
    setRefreshing(true);
    await fetchSchoolHealth();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "School health data updated",
    });
  };

  useEffect(() => {
    fetchSchoolHealth();
  }, []);

  const greenSchools = schoolHealth.filter(
    (school) => school.health_status === "green"
  ).length;
  const yellowSchools = schoolHealth.filter(
    (school) => school.health_status === "yellow"
  ).length;
  const redSchools = schoolHealth.filter(
    (school) => school.health_status === "red"
  ).length;
  const totalSchools = schoolHealth.length;

  const averageHealthScore =
    totalSchools > 0
      ? schoolHealth.reduce((sum, school) => sum + school.health_score, 0) /
        totalSchools
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            School Health Score
          </h2>
          <p className="text-muted-foreground">
            Automated health monitoring for all schools
          </p>
        </div>
        <Button
          onClick={refreshHealth}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthColor(
                averageHealthScore
              )}`}
            >
              {averageHealthScore.toFixed(1)}
            </div>
            <Progress value={averageHealthScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall health score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {greenSchools}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSchools > 0
                ? ((greenSchools / totalSchools) * 100).toFixed(1)
                : 0}
              % of schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {yellowSchools}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSchools > 0
                ? ((yellowSchools / totalSchools) * 100).toFixed(1)
                : 0}
              % of schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{redSchools}</div>
            <p className="text-xs text-muted-foreground">
              {totalSchools > 0
                ? ((redSchools / totalSchools) * 100).toFixed(1)
                : 0}
              % of schools
            </p>
          </CardContent>
        </Card>
      </div>

      {/* School Health List */}
      <Card>
        <CardHeader>
          <CardTitle>School Health Details</CardTitle>
          <CardDescription>
            Individual school health metrics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading school health data...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {schoolHealth.map((school) => (
                <div
                  key={school.school_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(school.health_status)}
                      <div>
                        <h3 className="font-medium">{school.school_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last activity:{" "}
                          {new Date(
                            school.last_activity_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${getHealthColor(
                          school.health_score
                        )}`}
                      >
                        {school.health_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Health Score
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {school.active_users_count}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Users
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {school.support_tickets_count}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Support Tickets
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {school.product_usage_score}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Usage Score
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {school.support_satisfaction_score}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Satisfaction
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getHealthBadgeVariant(school.health_status)}
                      >
                        {school.health_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {schoolHealth.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No school health data available
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Trends Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>
            School health score trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Health trends chart coming soon</p>
              <p className="text-sm text-gray-400">
                Will show health score trends and patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolHealthScoreWidget;
