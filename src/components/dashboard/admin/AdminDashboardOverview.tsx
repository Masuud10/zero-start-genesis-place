import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdminSchoolsData } from "@/hooks/useAdminSchoolsData";
import { useAdminUsersData } from "@/hooks/useAdminUsersData";

const AdminDashboardOverview: React.FC = () => {
  const {
    data: schools,
    isLoading: schoolsLoading,
    error: schoolsError,
    isRefetching: schoolsRefetching,
  } = useAdminSchoolsData();

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    isRefetching: usersRefetching,
  } = useAdminUsersData();

  // Handle loading states
  const isLoading = schoolsLoading || usersLoading;
  const isRefetching = schoolsRefetching || usersRefetching;

  // Handle error states
  const hasError = schoolsError || usersError;

  if (hasError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard data. Please refresh the page or contact
            support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate statistics with null safety
  const totalSchools = schools?.length || 0;
  const totalUsers = users?.length || 0;
  const usersWithSchools = users?.filter((user) => user.school_id)?.length || 0;
  const usersWithoutSchools = totalUsers - usersWithSchools;

  // Validate data integrity
  const hasValidData =
    totalSchools >= 0 &&
    totalUsers >= 0 &&
    !isNaN(totalSchools) &&
    !isNaN(totalUsers);

  if (!hasValidData) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid data received. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Schools",
      value: totalSchools,
      icon: Building2,
      color: "bg-blue-500",
      loading: schoolsLoading,
      refetching: schoolsRefetching,
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-green-500",
      loading: usersLoading,
      refetching: usersRefetching,
    },
    {
      title: "Users with Schools",
      value: usersWithSchools,
      icon: CheckCircle,
      color: "bg-emerald-500",
      loading: usersLoading,
      refetching: usersRefetching,
    },
    {
      title: "Users without Schools",
      value: usersWithoutSchools,
      icon: XCircle,
      color: "bg-orange-500",
      loading: usersLoading,
      refetching: usersRefetching,
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
            {isRefetching && (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Updating...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isCardLoading = stat.loading;
          const isCardRefetching = stat.refetching;

          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color} text-white`}>
                  {isCardLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isCardLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                {isCardRefetching && (
                  <Badge variant="secondary" className="mt-2">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recent activity...
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>• {totalSchools} schools registered in the system</p>
                <p>• {totalUsers} total users across all schools</p>
                <p>• {usersWithSchools} users have school assignments</p>
                <p>• {usersWithoutSchools} users pending school assignment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;
