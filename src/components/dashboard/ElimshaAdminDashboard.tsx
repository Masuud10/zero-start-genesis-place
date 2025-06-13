
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, BarChart3, Shield, Plus, School } from 'lucide-react';
import CreateSchoolDialog from '@/components/modules/schools/CreateSchoolDialog';
import { useQuery } from '@tanstack/react-query';
import { SchoolService } from '@/services/schoolService';
import { supabase } from '@/integrations/supabase/client';

interface ElimshaAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const ElimshaAdminDashboard = ({ onModalOpen }: ElimshaAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch schools data
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools', refreshKey],
    queryFn: async () => {
      const result = await SchoolService.getAllSchools();
      if (result.error) throw result.error;
      return result.data || [];
    }
  });

  // Fetch system metrics
  const { data: systemMetrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, school_id')
        .not('role', 'in', '("elimisha_admin","edufam_admin")');
      
      if (error) throw error;
      
      const stats = {
        totalUsers: data.length,
        usersWithSchools: data.filter(u => u.school_id).length,
        usersWithoutSchools: data.filter(u => !u.school_id).length,
        roleBreakdown: data.reduce((acc: Record<string, number>, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {})
      };
      
      return stats;
    }
  });

  const handleSchoolCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const systemOverviewCards = [
    {
      title: "Total Schools",
      value: schoolsData?.length || 0,
      description: "Active school tenants",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Total Users",
      value: userStats?.totalUsers || 0,
      description: "Across all schools",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Users Assigned",
      value: userStats?.usersWithSchools || 0,
      description: "Users linked to schools",
      icon: Shield,
      color: "text-purple-600"
    },
    {
      title: "Unassigned Users",
      value: userStats?.usersWithoutSchools || 0,
      description: "Need school assignment",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elimisha Admin Dashboard</h1>
          <p className="text-gray-600">System-wide overview and school management</p>
        </div>
        <CreateSchoolDialog onSchoolCreated={handleSchoolCreated} />
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemOverviewCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Administrative Actions
          </CardTitle>
          <CardDescription>
            Primary functions for system administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onModalOpen('schools')}
            >
              <School className="h-6 w-6" />
              <span>Manage Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onModalOpen('users')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onModalOpen('analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>System Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Schools */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Schools</CardTitle>
          <CardDescription>
            Latest school tenants created in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="text-center py-4">Loading schools...</div>
          ) : schoolsData && schoolsData.length > 0 ? (
            <div className="space-y-3">
              {schoolsData.slice(0, 5).map((school: any) => (
                <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{school.name}</h4>
                    <p className="text-sm text-gray-600">{school.email}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(school.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No schools created yet</p>
              <CreateSchoolDialog onSchoolCreated={handleSchoolCreated} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      {systemMetrics && systemMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Metrics</CardTitle>
            <CardDescription>
              Latest system performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemMetrics.map((metric: any) => (
                <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{metric.metric_name}</h4>
                    <p className="text-sm text-gray-600">{metric.metric_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{metric.metric_value}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(metric.recorded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElimshaAdminDashboard;
