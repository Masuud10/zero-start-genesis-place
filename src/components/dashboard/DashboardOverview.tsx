import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  School,
  UserPlus,
  Settings,
  BarChart3,
  Shield,
  Database,
  Bell,
  Activity,
  AlertTriangle,
  Crown,
  DollarSign,
  Target,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigation } from "@/contexts/NavigationContext";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { useDashboard } from "@/contexts/DashboardContext";

interface DashboardOverviewProps {
  role: "super_admin" | "support_hr" | "software_engineer" | "sales_marketing" | "finance";
  greeting: string;
  userName?: string;
}

interface SuperAdminAnalytics {
  schools: {
    total: number;
    active: number;
    new_this_month: number;
  };
  users: {
    total: number;
    school_users: number;
    admin_users: number;
    active: number;
    new_this_month: number;
  };
  students: {
    total: number;
    new_this_month: number;
  };
  recent_activities: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    school_name: string;
    created_at: string;
  }>;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  role,
  greeting,
  userName = "Admin",
}) => {
  const { setCurrentPage } = useNavigation();
  const { signOut } = useConsolidatedAuth();
  const { kpiData, loadingKPIs } = useDashboard();
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'super_admin') {
      fetchSuperAdminAnalytics();
    }
  }, [role]);

  const fetchSuperAdminAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_super_admin_analytics');
      
      if (error) throw error;
      
      if (data && (data as any).success) {
        setAnalytics((data as any));
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_school':
        setCurrentPage('Schools Management');
        break;
      case 'manage_users':
        setCurrentPage('School User Management');
        break;
      case 'admin_users':
        setCurrentPage('Admin User Management');
        break;
      case 'system_settings':
        setCurrentPage('Database Settings');
        break;
      case 'security':
        setCurrentPage('Security Settings');
        break;
      case 'maintenance':
        setCurrentPage('Maintenance Mode');
        break;
      default:
        break;
    }
  };

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
      case "super_admin": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "support_hr": return "text-blue-600 bg-blue-50 border-blue-200";
      case "software_engineer": return "text-green-600 bg-green-50 border-green-200";
      case "sales_marketing": return "text-purple-600 bg-purple-50 border-purple-200";
      case "finance": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (role !== 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg border ${getRoleColor()}`}>
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{greeting}</h1>
              <p className="text-muted-foreground">Welcome back, {userName}!</p>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
              <p className="text-xs text-muted-foreground">
                Dashboard features will be available soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg border ${getRoleColor()}`}>
            {getRoleIcon()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{greeting}</h1>
            <p className="text-muted-foreground">Welcome back, {userName}!</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Super Admin
          </Badge>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Total Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.schools?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.schools?.new_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.users?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.users?.new_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.students?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.students?.new_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Active Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.schools?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('create_school')}
            >
              <School className="h-8 w-8" />
              <span className="text-xs">Manage Schools</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('manage_users')}
            >
              <UserPlus className="h-8 w-8" />
              <span className="text-xs">School Users</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('admin_users')}
            >
              <Shield className="h-8 w-8" />
              <span className="text-xs">Admin Users</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('system_settings')}
            >
              <Database className="h-8 w-8" />
              <span className="text-xs">Database</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('security')}
            >
              <Settings className="h-8 w-8" />
              <span className="text-xs">Security</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto p-4 space-y-2"
              onClick={() => handleQuickAction('maintenance')}
            >
              <AlertTriangle className="h-8 w-8" />
              <span className="text-xs">Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest user registrations and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.recent_activities?.slice(0, 8).map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.email} • {activity.role} • {activity.school_name}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">School Users</span>
                <span className="font-medium">{analytics?.users?.school_users || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Admin Users</span>
                <span className="font-medium">{analytics?.users?.admin_users || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <span className="font-medium text-green-600">{analytics?.users?.active || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Services</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Healthy
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Authentication</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;