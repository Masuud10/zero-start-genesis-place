import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface SchoolData {
  name?: string;
  created_at: string;
}

interface SchoolTypeAccumulator {
  [key: string]: number;
}

interface StatusDataEntry {
  name: string;
  value: number;
  color: string;
}

const AdminAnalyticsOverview = () => {
  // Fetch schools data
  const { data: schoolsData } = useQuery({
    queryKey: ["admin-schools-analytics"],
    queryFn: async () => {
      const { data: schools } = await supabase.from("schools").select("*");

      // Group schools by type (based on name patterns or explicit type field)
      const schoolTypes = schools?.reduce(
        (acc: SchoolTypeAccumulator, school: SchoolData) => {
          let type = "Primary"; // Default
          if (
            school.name?.toLowerCase().includes("secondary") ||
            school.name?.toLowerCase().includes("high")
          ) {
            type = "Secondary";
          } else if (
            school.name?.toLowerCase().includes("college") ||
            school.name?.toLowerCase().includes("university")
          ) {
            type = "College";
          }
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {}
      );

      const schoolsChartData = Object.entries(schoolTypes || {}).map(
        ([type, count]) => ({
          type,
          count,
        })
      );

      // Active vs Inactive schools - using created_at to determine if school is recent (active)
      const currentDate = new Date();
      const sixMonthsAgo = new Date(
        currentDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
      );

      const activeSchools =
        schools?.filter((school) => new Date(school.created_at) >= sixMonthsAgo)
          .length || 0;
      const inactiveSchools = (schools?.length || 0) - activeSchools;

      const statusData = [
        { name: "Active Schools", value: activeSchools, color: "#10B981" },
        { name: "Inactive Schools", value: inactiveSchools, color: "#EF4444" },
      ];

      return { schoolsChartData, statusData };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch system trends data
  const { data: trendsData } = useQuery({
    queryKey: ["admin-trends-analytics"],
    queryFn: async () => {
      // Get monthly data for the last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          startDate: new Date(date.getFullYear(), date.getMonth(), 1),
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        });
      }

      const trendsPromises = months.map(
        async ({ month, startDate, endDate }) => {
          // Get grades count
          const { count: gradesCount } = await supabase
            .from("grades")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          // Get attendance count
          const { count: attendanceCount } = await supabase
            .from("attendance")
            .select("*", { count: "exact", head: true })
            .gte("submitted_at", startDate.toISOString())
            .lte("submitted_at", endDate.toISOString());

          // Get fee payments count
          const { count: feePayments } = await supabase
            .from("financial_transactions")
            .select("*", { count: "exact", head: true })
            .eq("transaction_type", "payment")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          return {
            month,
            grades: gradesCount || 0,
            attendance: attendanceCount || 0,
            payments: feePayments || 0,
          };
        }
      );

      return Promise.all(trendsPromises);
    },
    staleTime: 5 * 60 * 1000,
  });

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics Overview
        </h2>
        <p className="text-gray-600">
          Real-time system analytics and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schools Summary Bar Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Schools by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={schoolsData?.schoolsChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Number of Schools"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Trends Line Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendsData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="grades"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="Grades Recorded"
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Attendance Records"
                />
                <Line
                  type="monotone"
                  dataKey="payments"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  name="Fee Payments"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Schools Status Pie Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              Schools Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={schoolsData?.statusData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {schoolsData?.statusData?.map(
                    (entry: StatusDataEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;
