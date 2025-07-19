import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Building2,
  Crown,
  Zap,
  BarChart3,
  PieChart,
  Target,
  Clock,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { LineChart, BarChart, PieChart as CustomPieChart } from "@/components/ui/BeautifulCharts";

interface DashboardOverviewProps {
  role: "super_admin" | "support_hr" | "software_engineer" | "sales_marketing" | "finance";
  greeting: string;
  userName?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  role, 
  greeting, 
  userName = "Admin" 
}) => {
  const { kpiData, loadingKPIs } = useDashboard();

  const getRoleIcon = () => {
    switch (role) {
      case "super_admin": return <Crown className="h-6 w-6 text-yellow-600" />;
      case "support_hr": return <Users className="h-6 w-6 text-blue-600" />;
      case "software_engineer": return <Activity className="h-6 w-6 text-green-600" />;
      case "sales_marketing": return <Target className="h-6 w-6 text-purple-600" />;
      case "finance": return <DollarSign className="h-6 w-6 text-emerald-600" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "super_admin": return "from-yellow-500 to-amber-600";
      case "support_hr": return "from-blue-500 to-cyan-600";
      case "software_engineer": return "from-green-500 to-emerald-600";
      case "sales_marketing": return "from-purple-500 to-violet-600";
      case "finance": return "from-emerald-500 to-teal-600";
      default: return "from-gray-500 to-slate-600";
    }
  };

  const getStatsForRole = () => {
    if (!kpiData) return [];
    
    switch (role) {
      case "super_admin":
        return [
          { title: "Total Schools", value: kpiData.schools.total, icon: Building2, change: "+8.5%" },
          { title: "Monthly Revenue", value: `$${kpiData.revenue.mrr.toLocaleString()}`, icon: DollarSign, change: "+15.2%" },
          { title: "Total Users", value: kpiData.users.total, icon: Users, change: "+12.3%" },
          { title: "Active Schools", value: kpiData.schools.active, icon: Activity, change: "+5.1%" },
        ];
      case "support_hr":
        return [
          { title: "Open Tickets", value: 23, icon: Clock, change: "-12%" },
          { title: "Resolved Today", value: 18, icon: Target, change: "+8%" },
          { title: "Response Time", value: "2.5h", icon: Activity, change: "-15%" },
          { title: "Satisfaction", value: "94%", icon: TrendingUp, change: "+3%" },
        ];
      case "software_engineer":
        return [
          { title: "System Uptime", value: "99.9%", icon: Activity, change: "0%" },
          { title: "API Requests", value: "45.2K", icon: BarChart3, change: "+22%" },
          { title: "Database Size", value: "2.1GB", icon: Building2, change: "+5%" },
          { title: "Error Rate", value: "0.02%", icon: TrendingDown, change: "-40%" },
        ];
      case "sales_marketing":
        return [
          { title: "Leads", value: 156, icon: Target, change: "+18%" },
          { title: "Conversions", value: "12.5%", icon: TrendingUp, change: "+3.2%" },
          { title: "Pipeline Value", value: "$245K", icon: DollarSign, change: "+25%" },
          { title: "Active Campaigns", value: 8, icon: Activity, change: "+2" },
        ];
      case "finance":
        return [
          { title: "Revenue", value: `$${kpiData.revenue.mrr.toLocaleString()}`, icon: DollarSign, change: "+15.2%" },
          { title: "Expenses", value: "$8,420", icon: TrendingDown, change: "-5%" },
          { title: "Profit Margin", value: "45.2%", icon: TrendingUp, change: "+2.1%" },
          { title: "Churn Rate", value: `${(kpiData.revenue.churnRate * 100).toFixed(1)}%`, icon: TrendingDown, change: "-1.2%" },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (role) {
      case "super_admin":
        return [
          { label: "Add School", icon: Building2, action: () => {} },
          { label: "Create User", icon: Users, action: () => {} },
          { label: "View Reports", icon: BarChart3, action: () => {} },
          { label: "System Settings", icon: Activity, action: () => {} },
        ];
      case "support_hr":
        return [
          { label: "New Ticket", icon: Clock, action: () => {} },
          { label: "Assign Ticket", icon: Users, action: () => {} },
          { label: "View Reports", icon: BarChart3, action: () => {} },
          { label: "HR Settings", icon: Activity, action: () => {} },
        ];
      case "software_engineer":
        return [
          { label: "Deploy Code", icon: Activity, action: () => {} },
          { label: "Check Logs", icon: BarChart3, action: () => {} },
          { label: "Database", icon: Building2, action: () => {} },
          { label: "Monitoring", icon: TrendingUp, action: () => {} },
        ];
      case "sales_marketing":
        return [
          { label: "Add Lead", icon: Target, action: () => {} },
          { label: "New Campaign", icon: Activity, action: () => {} },
          { label: "Analytics", icon: BarChart3, action: () => {} },
          { label: "CRM Settings", icon: Users, action: () => {} },
        ];
      case "finance":
        return [
          { label: "Record Payment", icon: DollarSign, action: () => {} },
          { label: "Generate Invoice", icon: BarChart3, action: () => {} },
          { label: "Expense Report", icon: TrendingDown, action: () => {} },
          { label: "Budget Plan", icon: Target, action: () => {} },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();
  const quickActions = getQuickActions();

  if (loadingKPIs) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Container */}
      <Card className={`bg-gradient-to-r ${getRoleColor()} text-white border-0 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getRoleIcon()}
              <div>
                <h1 className="text-2xl font-bold">{greeting}, {userName}!</h1>
                <p className="text-white/80 capitalize">{role.replace('_', ' ')} Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={[
                { label: "Jan", value: 4000 },
                { label: "Feb", value: 3000 },
                { label: "Mar", value: 5000 },
                { label: "Apr", value: 4500 },
                { label: "May", value: 6000 },
                { label: "Jun", value: 5500 },
              ]}
              title="Monthly Growth"
              height={200}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Distribution Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomPieChart
              data={[
                { label: "Category A", value: 35 },
                { label: "Category B", value: 25 },
                { label: "Category C", value: 40 },
              ]}
              title="Usage Distribution"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={action.action}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;