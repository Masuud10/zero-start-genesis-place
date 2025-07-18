import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminSchoolsData } from "@/hooks/useAdminSchoolsData";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Calendar,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

const AnalyticsModule: React.FC = () => {
  const { adminUser } = useAdminAuthContext();
  const { data: schools = [], isLoading, error } = useAdminSchoolsData();

  // Calculate analytics data
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.status === "active").length;
  const inactiveSchools = schools.filter((s) => s.status === "inactive").length;
  const suspendedSchools = schools.filter(
    (s) => s.status === "suspended"
  ).length;

  const recentSchools = schools.filter((s) => {
    const createdAt = new Date(s.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt >= thirtyDaysAgo;
  }).length;

  const schoolTypes = schools.reduce((acc, school) => {
    const type = school.school_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getGrowthRate = () => {
    if (totalSchools === 0) return 0;
    const lastMonth = schools.filter((s) => {
      const createdAt = new Date(s.created_at);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return createdAt >= lastMonth;
    }).length;
    return ((lastMonth / totalSchools) * 100).toFixed(1);
  };

  const getStatusPercentage = (status: string) => {
    if (totalSchools === 0) return 0;
    const count = schools.filter((s) => s.status === status).length;
    return ((count / totalSchools) * 100).toFixed(1);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
          <p className="text-muted-foreground">
            Error loading analytics data: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            System Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights into the EduFam system performance
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Activity className="h-3 w-3" />
          <span>Real-time</span>
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalSchools
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span>+{getGrowthRate()}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schools
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeSchools
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {getStatusPercentage("active")}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "1,234"
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span>+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>School Status Distribution</span>
            </CardTitle>
            <CardDescription>
              Breakdown of schools by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{activeSchools}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getStatusPercentage("active")}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{inactiveSchools}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getStatusPercentage("inactive")}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Suspended</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{suspendedSchools}</span>
                  <span className="text-xs text-muted-foreground">
                    ({getStatusPercentage("suspended")}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>School Types</span>
            </CardTitle>
            <CardDescription>Distribution of schools by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(schoolTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / totalSchools) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              System activity over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Schools</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{recentSchools}</span>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New Users</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">156</span>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Support Tickets</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">23</span>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Alerts</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">2</span>
                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-bold text-green-600">45ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-bold text-green-600">0.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Queries</span>
                <span className="text-sm font-bold">1.2k/min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm font-bold">89</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Academic Analytics</span>
          </CardTitle>
          <CardDescription>
            Educational performance metrics across all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">87.5%</div>
              <div className="text-sm text-muted-foreground">
                Average Attendance
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">92.3%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4.2</div>
              <div className="text-sm text-muted-foreground">Average GPA</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Financial Overview</span>
          </CardTitle>
          <CardDescription>Revenue and billing statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$45,230</div>
              <div className="text-sm text-muted-foreground">
                Monthly Revenue
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$12,450</div>
              <div className="text-sm text-muted-foreground">
                Pending Payments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">94.2%</div>
              <div className="text-sm text-muted-foreground">
                Collection Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-muted-foreground">
                Active Subscriptions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsModule;
