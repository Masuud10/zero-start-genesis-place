
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, BarChart3, Shield, Plus, School, UserPlus, TrendingUp, Activity, CheckCircle } from 'lucide-react';
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
      try {
        const result = await SchoolService.getAllSchools();
        if (result.error) throw result.error;
        return result.data || [];
      } catch (error) {
        console.error('Error fetching schools:', error);
        return [];
      }
    }
  });

  // Fetch user statistics using AdminUserService
  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: async () => {
      try {
        const { data, error } = await AdminUserService.getUsersForSchool();
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
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

  // Calculate user statistics with proper error handling
  const userStats = usersData ? {
    totalUsers: usersData.length,
    usersWithSchools: usersData.filter(u => u.school_id).length,
    usersWithoutSchools: usersData.filter(u => !u.school_id).length,
    roleBreakdown: usersData.reduce((acc: Record<string, number>, user) => {
      const role = user.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
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
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Total Users",
      value: userStats.totalUsers,
      description: "Across all schools",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Users Assigned",
      value: userStats.usersWithSchools,
      description: "Users linked to schools",
      icon: CheckCircle,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+15%",
      trend: "up"
    },
    {
      title: "Unassigned Users",
      value: userStats.usersWithoutSchools,
      description: "Need school assignment",
      icon: Activity,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "-5%",
      trend: "down"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Reduced Size System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemOverviewCards.map((card, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}></div>
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient} shadow-md group-hover:scale-105 transition-transform duration-200`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className={`h-3 w-3 ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className={`font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Administrative Hub
          </CardTitle>
          <CardDescription className="text-sm">
            Quick access to essential system management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-200 transition-all duration-200 group"
              onClick={() => onModalOpen('schools')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
                <School className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-sm">Manage Schools</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 border-2 hover:border-emerald-200 transition-all duration-200 group"
              onClick={() => onModalOpen('users')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-105 transition-transform duration-200">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-sm">Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-200 transition-all duration-200 group"
              onClick={() => onModalOpen('analytics')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-sm">System Analytics</span>
            </Button>
            <CreateUserDialog onUserCreated={handleUserCreated}>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-200 transition-all duration-200 group w-full"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-105 transition-transform duration-200">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-sm">Create User</span>
              </Button>
            </CreateUserDialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Schools */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            Recent Schools
          </CardTitle>
          <CardDescription>
            Latest educational institutions joining the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schoolsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading schools...</span>
            </div>
          ) : schoolsData && schoolsData.length > 0 ? (
            <div className="space-y-3">
              {schoolsData.slice(0, 5).map((school: any) => (
                <div key={school.id} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white border hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{school.name}</h4>
                      <p className="text-xs text-gray-600">{school.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {new Date(school.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-3">No schools created yet</p>
              <p className="text-gray-500 text-xs mb-4">Start building your educational network</p>
              <CreateSchoolDialog onSchoolCreated={handleSchoolCreated} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Role Breakdown */}
      {userStats.totalUsers > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              User Role Distribution
            </CardTitle>
            <CardDescription>
              Active user breakdown across all educational institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(userStats.roleBreakdown).map(([role, count], index) => {
                const gradients = [
                  'from-blue-500 to-blue-600',
                  'from-emerald-500 to-emerald-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600'
                ];
                const bgGradients = [
                  'from-blue-50 to-blue-100',
                  'from-emerald-50 to-emerald-100', 
                  'from-purple-50 to-purple-100',
                  'from-orange-50 to-orange-100'
                ];
                return (
                  <div key={role} className={`text-center p-4 bg-gradient-to-br ${bgGradients[index % 4]} rounded-lg hover:shadow-md transition-all duration-200 group border`}>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradients[index % 4]} w-fit mx-auto mb-2 group-hover:scale-105 transition-transform duration-200`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{count as number}</p>
                    <p className="text-xs text-gray-600 capitalize font-medium">{role.replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElimshaAdminDashboard;
