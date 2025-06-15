
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

interface SystemStats {
  totalSchools: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: string;
  totalTransactions: number;
  avgPerformance: number;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ user, onModalOpen }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats>({
    totalSchools: 0,
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'Good',
    totalTransactions: 0,
    avgPerformance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);

      // Fetch system-wide statistics
      const [
        schoolsResult,
        usersResult,
        transactionsResult
      ] = await Promise.allSettled([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('financial_transactions').select('id', { count: 'exact' })
      ]);

      const totalSchools = schoolsResult.status === 'fulfilled' ? (schoolsResult.value?.count || 0) : 0;
      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value?.count || 0) : 0;
      const totalTransactions = transactionsResult.status === 'fulfilled' ? (transactionsResult.value?.count || 0) : 0;

      setStats({
        totalSchools,
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.8), // Mock active users
        systemHealth: 'Good',
        totalTransactions,
        avgPerformance: 98.5 // Mock performance metric
      });

    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const systemActions = [
    { id: 'schools', label: 'Manage Schools', icon: Building2, description: 'Add and configure schools' },
    { id: 'users', label: 'User Management', icon: Users, description: 'Manage system users' },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3, description: 'View system performance' },
    { id: 'security', label: 'Security Center', icon: Shield, description: 'Security monitoring' },
    { id: 'settings', label: 'System Settings', icon: Settings, description: 'Configure system' },
    { id: 'health', label: 'System Health', icon: Activity, description: 'Monitor system status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Administration</h2>
          <p className="text-muted-foreground">
            Welcome {user.name}! Monitor and manage the entire EduFam system.
          </p>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <span className="animate-pulse">...</span> : stats.totalSchools}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.totalSchools === 0 ? "No schools" : "Active institutions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <span className="animate-pulse">...</span> : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : `${stats.activeUsers} active users`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <span className="animate-pulse">...</span> : stats.systemHealth}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : `${stats.avgPerformance}% uptime`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? <span className="animate-pulse">...</span> : stats.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : "System-wide"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Management
          </CardTitle>
          <CardDescription>
            Access system-wide administrative features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-24 flex-col gap-2 p-4"
                onClick={() => onModalOpen(action.id)}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdminDashboard;
