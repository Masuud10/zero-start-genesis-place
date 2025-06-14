
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, BarChart3, Shield, Plus, School, UserPlus } from 'lucide-react';
import CreateSchoolDialog from '@/components/modules/schools/CreateSchoolDialog';
import CreateUserDialog from '@/components/modules/users/CreateUserDialog';
import { useQuery } from '@tanstack/react-query';
import { SchoolService } from '@/services/schoolService';
import { AdminUserService } from '@/services/adminUserService';

interface ElimshaAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const ElimshaAdminDashboard = ({ onModalOpen }: ElimshaAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch schools data
  const { data: schoolsData, isLoading: schoolsLoading, refetch: refetchSchools } = useQuery({
    queryKey: ['schools', refreshKey],
    queryFn: async () => {
      const result = await SchoolService.getAllSchools();
      if (result.error) throw result.error;
      return result.data || [];
    }
  });

  // Fetch user statistics using AdminUserService
  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: async () => {
      const { data, error } = await AdminUserService.getUsersForSchool();
      if (error) throw error;
      return data || [];
    }
  });

  const handleSchoolCreated = () => {
    setRefreshKey(prev => prev + 1);
    refetchSchools();
  };

  const handleUserCreated = () => {
    setRefreshKey(prev => prev + 1);
    refetchUsers();
  };

  // Calculate user statistics
  const userStats = usersData ? {
    totalUsers: usersData.length,
    usersWithSchools: usersData.filter(u => u.school_id).length,
    usersWithoutSchools: usersData.filter(u => !u.school_id).length,
    roleBreakdown: usersData.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {})
  } : {
    totalUsers: 0,
    usersWithSchools: 0,
    usersWithoutSchools: 0,
    roleBreakdown: {}
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
      value: userStats.totalUsers,
      description: "Across all schools",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Users Assigned",
      value: userStats.usersWithSchools,
      description: "Users linked to schools",
      icon: Shield,
      color: "text-purple-600"
    },
    {
      title: "Unassigned Users",
      value: userStats.usersWithoutSchools,
      description: "Need school assignment",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">System-wide overview and school management</p>
        </div>
        <div className="flex gap-3">
          <CreateUserDialog onUserCreated={handleUserCreated}>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </CreateUserDialog>
          <CreateSchoolDialog onSchoolCreated={handleSchoolCreated} />
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemOverviewCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-blue-50"
              onClick={() => onModalOpen('schools')}
            >
              <School className="h-6 w-6" />
              <span>Manage Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-green-50"
              onClick={() => onModalOpen('users')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-purple-50"
              onClick={() => onModalOpen('analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>System Analytics</span>
            </Button>
            <CreateUserDialog onUserCreated={handleUserCreated}>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-orange-50 w-full"
              >
                <UserPlus className="h-6 w-6" />
                <span>Create User</span>
              </Button>
            </CreateUserDialog>
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
                <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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

      {/* User Role Breakdown */}
      {userStats.totalUsers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>
              Breakdown of users by role across all schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(userStats.roleBreakdown).map(([role, count]) => (
                <div key={role} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                  <p className="text-sm text-gray-600 capitalize">{role.replace('_', ' ')}</p>
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
