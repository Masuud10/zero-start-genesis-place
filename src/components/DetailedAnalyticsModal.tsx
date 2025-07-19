import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
  Download,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useSystemAnalytics } from "@/hooks/useSystemAnalytics";
import { useToast } from "@/hooks/use-toast";

interface DetailedAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChartType = "bar" | "line" | "pie" | "area";
type TimeFilter = "7d" | "30d" | "90d" | "1y";

interface ChartDataPoint {
  month: string;
  color?: string;
  [key: string]: string | number | undefined;
}

const DetailedAnalyticsModal: React.FC<DetailedAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [activeTab, setActiveTab] = useState("overview");

  const { analyticsData, isLoading, error, exportData, isExporting } =
    useSystemAnalytics({ dateRange: timeFilter });

  const handleExport = () => {
    exportData("json", true, true);
  };

  const renderChart = (
    data: ChartDataPoint[],
    dataKey: string,
    name: string,
    color: string
  ) => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} name={name} />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              name={name}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey}
              fill={color}
              stroke={color}
              name={name}
            />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={color}
              dataKey={dataKey}
              label={({ month, [dataKey]: value }) => `${month}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Analytics</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              Failed to load analytics data
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detailed System Analytics
            </DialogTitle>
            <div className="flex gap-2">
              {/* Time Filter */}
              <Select
                value={timeFilter}
                onValueChange={(value: TimeFilter) => setTimeFilter(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="90d">90d</SelectItem>
                  <SelectItem value="1y">1y</SelectItem>
                </SelectContent>
              </Select>

              {/* Chart Type Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="rounded-none first:rounded-l-md"
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="rounded-none"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("pie")}
                  className="rounded-none last:rounded-r-md"
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-2">Loading detailed analytics...</span>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="schools">Schools</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Platform Growth
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {renderChart(
                      analyticsData?.schoolRegistrationTrend || [],
                      "schools",
                      "Schools",
                      "#3b82f6"
                    )}
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {renderChart(
                      analyticsData?.userGrowthTrend || [],
                      "users",
                      "Users",
                      "#10b981"
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    User Role Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.userRoleDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ role, count, percentage }) =>
                          `${role}: ${count} (${percentage.toFixed(1)}%)`
                        }
                      >
                        {analyticsData?.userRoleDistribution?.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    User Growth Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {renderChart(
                      analyticsData?.userGrowthTrend || [],
                      "growth",
                      "Growth %",
                      "#8b5cf6"
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schools" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    School Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.schoolsByStatus || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {analyticsData?.schoolsByStatus?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    School Registration Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {renderChart(
                      analyticsData?.schoolRegistrationTrend || [],
                      "growth",
                      "Growth %",
                      "#f59e0b"
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Subscription Plans
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.subscriptionData || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ plan, count }) => `${plan}: ${count}`}
                      >
                        {analyticsData?.subscriptionData?.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {renderChart(
                      analyticsData?.billingTrend || [],
                      "revenue",
                      "Revenue",
                      "#ec4899"
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    System Performance
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.performanceMetrics || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Performance"]}
                      />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Real-time Stats
                  </h3>
                  <div className="space-y-4">
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
                      <div className="text-sm font-medium text-gray-600">
                        System Load
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {analyticsData?.systemLoad || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailedAnalyticsModal;
