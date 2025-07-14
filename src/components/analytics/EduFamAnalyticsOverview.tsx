import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSystemAnalytics } from "@/hooks/useSystemAnalytics";
import { useToast } from "@/hooks/use-toast";
import SystemAnalyticsChartsSection from "./sections/SystemAnalyticsChartsSection";

interface EduFamAnalyticsOverviewProps {
  onAnalyticsAction?: (action: string) => void;
}

const EduFamAnalyticsOverview: React.FC<EduFamAnalyticsOverviewProps> = ({
  onAnalyticsAction,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const {
    analyticsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    exportData,
    isExporting,
  } = useSystemAnalytics({ dateRange });

  const handleRefresh = () => {
    console.log("📊 EduFamAnalyticsOverview: Refreshing analytics data");
    refetch();
  };

  const handleExportAnalytics = () => {
    console.log("📊 EduFamAnalyticsOverview: Exporting analytics data");
    exportData();
  };

  const handleViewDetailedAnalytics = () => {
    console.log("📊 EduFamAnalyticsOverview: Toggling detailed analytics view");
    setIsDetailsVisible(!isDetailsVisible);
    onAnalyticsAction?.("view-detailed-analytics");
  };

  const handleDateRangeChange = (newRange: "7d" | "30d" | "90d" | "1y") => {
    setDateRange(newRange);
  };

  // Permission check
  if (!user || user.role !== "edufam_admin") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access system analytics.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            System Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Loading analytics data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            System Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error instanceof Error
                ? error.message
                : "Failed to load analytics data"}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="ml-2"
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              System Analytics Overview
            </CardTitle>
            <CardDescription>
              Real-time platform performance and growth metrics
              {analyticsData?.dataFreshness && (
                <span className="ml-2 text-xs text-gray-500">
                  (Data fetched in {analyticsData.dataFreshness})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Date Range Selector */}
            <div className="flex border rounded-md">
              {(["7d", "30d", "90d", "1y"] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleDateRangeChange(range)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {range}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>

            <Button
              onClick={handleExportAnalytics}
              variant="outline"
              size="sm"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Total Schools
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {analyticsData?.totalSchools || 0}
            </div>
            <div className="text-xs text-blue-600">
              {analyticsData?.schoolGrowthRate > 0 ? "+" : ""}
              {analyticsData?.schoolGrowthRate || 0}% this month
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Total Users
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {analyticsData?.totalUsers || 0}
            </div>
            <div className="text-xs text-green-600">
              {analyticsData?.userGrowthRate > 0 ? "+" : ""}
              {analyticsData?.userGrowthRate || 0}% this month
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                Monthly Growth
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {analyticsData?.userGrowthRate || 0}%
            </div>
            <div className="text-xs text-purple-600">
              {analyticsData?.newUsersThisMonth || 0} new users
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">
                Revenue Growth
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {analyticsData?.revenueGrowthRate || 0}%
            </div>
            <div className="text-xs text-orange-600">
              ${analyticsData?.monthlyRevenue || 0} this month
            </div>
          </div>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Platform Growth Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData?.schoolRegistrationTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="schools"
                  stroke="#3b82f6"
                  name="Schools"
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              User Role Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData?.userRoleDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ role, count }) => `${role}: ${count}`}
                >
                  {analyticsData?.userRoleDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">System Health Metrics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analyticsData?.performanceMetrics || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Performance"]} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-600">
              Current Online Users
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData?.currentOnlineUsers || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-600">
              Active Sessions
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData?.activeSessions || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-600">System Load</div>
            <div className="text-2xl font-bold text-gray-900">
              {analyticsData?.systemLoad || 0}%
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleViewDetailedAnalytics}
            variant="default"
            className="flex-1 flex items-center gap-2"
          >
            {isDetailsVisible ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Detailed Analytics
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View Detailed Analytics
              </>
            )}
          </Button>
          <Button
            onClick={handleExportAnalytics}
            variant="outline"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Detailed Analytics Section - Conditionally Rendered */}
    {isDetailsVisible && (
      <div className="detailed-analytics-container mt-6 w-full">
        <Card className="animate-in slide-in-from-top-5 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              Detailed System Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive analytics with detailed charts and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full overflow-hidden">
              <SystemAnalyticsChartsSection />
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </>
  );
};

export default EduFamAnalyticsOverview;
