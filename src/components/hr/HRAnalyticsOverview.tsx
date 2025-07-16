import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
} from "lucide-react";
import { AuthUser } from "@/types/auth";

interface HRAnalyticsOverviewProps {
  user: AuthUser;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#82ca9d", "#ffc658", "#ff7300"];

const HRAnalyticsOverview: React.FC<HRAnalyticsOverviewProps> = ({ user }) => {
  // Fetch support staff analytics
  const { data: staffAnalytics, isLoading } = useQuery({
    queryKey: ["hr-analytics", user.school_id],
    queryFn: async () => {
      const { data: supportStaff, error } = await supabase
        .from("support_staff")
        .select("*")
        .eq("school_id", user.school_id);

      if (error) throw error;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("school_id", user.school_id);

      if (profilesError) throw profilesError;

      // Calculate analytics
      const activeStaff = supportStaff?.filter(s => s.is_active) || [];
      const totalStaff = supportStaff?.length || 0;
      
      // Role distribution
      const roleDistribution = supportStaff?.reduce((acc, staff) => {
        const role = staff.role_title;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const roleChartData = Object.entries(roleDistribution).map(([role, count]) => ({
        role,
        count,
        fill: COLORS[Object.keys(roleDistribution).indexOf(role) % COLORS.length]
      }));

      // Employment type distribution
      const employmentTypes = supportStaff?.reduce((acc, staff) => {
        const type = staff.employment_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const employmentChartData = Object.entries(employmentTypes).map(([type, count]) => ({
        type,
        count,
      }));

      // Salary distribution by role
      const salaryByRole = supportStaff?.filter(s => s.salary_amount).reduce((acc, staff) => {
        const role = staff.role_title;
        if (!acc[role]) {
          acc[role] = { total: 0, count: 0 };
        }
        acc[role].total += staff.salary_amount || 0;
        acc[role].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>) || {};

      const salaryChartData = Object.entries(salaryByRole).map(([role, data]) => ({
        role,
        averageSalary: Math.round(data.total / data.count),
        totalStaff: data.count,
      }));

      // Monthly hiring trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const hiringTrends = supportStaff?.filter(s => new Date(s.created_at) > sixMonthsAgo)
        .reduce((acc, staff) => {
          const month = new Date(staff.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const hiringTrendData = Object.entries(hiringTrends).map(([month, hires]) => ({
        month,
        hires,
      }));

      // User role distribution
      const userRoles = profiles?.reduce((acc, user) => {
        const role = user.role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const userRoleChartData = Object.entries(userRoles).map(([role, count]) => ({
        role,
        count,
        fill: COLORS[Object.keys(userRoles).indexOf(role) % COLORS.length]
      }));

      return {
        totalStaff,
        activeStaff: activeStaff.length,
        totalUsers: profiles?.length || 0,
        activeUsers: profiles?.filter(u => u.status !== 'inactive').length || 0,
        avgSalary: salaryChartData.length > 0 ? salaryChartData.reduce((sum, item) => sum + (item.averageSalary || 0), 0) / salaryChartData.length : 0,
        roleDistribution: roleChartData,
        employmentTypes: employmentChartData,
        salaryByRole: salaryChartData,
        hiringTrends: hiringTrendData,
        userRoleDistribution: userRoleChartData,
      };
    },
    enabled: !!user.school_id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading HR analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffAnalytics?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              {staffAnalytics?.activeStaff || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffAnalytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {staffAnalytics?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {Math.round(staffAnalytics?.avgSalary || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Retention</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffAnalytics?.totalStaff ? Math.round((staffAnalytics.activeStaff / staffAnalytics.totalStaff) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Active retention rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Staff Role Distribution
            </CardTitle>
            <CardDescription>Distribution of staff by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={staffAnalytics?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count }) => `${role}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {staffAnalytics?.roleDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employment Type Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Employment Types
            </CardTitle>
            <CardDescription>Staff by employment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffAnalytics?.employmentTypes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Average Salary by Role
            </CardTitle>
            <CardDescription>Average monthly salary per role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffAnalytics?.salaryByRole || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Average Salary']}
                />
                <Bar dataKey="averageSalary" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hiring Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hiring Trends
            </CardTitle>
            <CardDescription>New staff hired over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={staffAnalytics?.hiringTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hires" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System User Role Distribution
          </CardTitle>
          <CardDescription>Distribution of all system users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staffAnalytics?.userRoleDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, count }) => `${role}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {staffAnalytics?.userRoleDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRAnalyticsOverview;