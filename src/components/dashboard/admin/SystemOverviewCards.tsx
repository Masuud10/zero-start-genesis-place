
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, CheckCircle, Activity, TrendingUp } from 'lucide-react';

interface SystemOverviewCardsProps {
  schoolsCount: number;
  totalUsers: number;
  usersWithSchools: number;
  usersWithoutSchools: number;
  schoolsLoading: boolean;
  usersLoading: boolean;
  schoolsRefetching: boolean;
  usersRefetching: boolean;
}

const SystemOverviewCards: React.FC<SystemOverviewCardsProps> = ({
  schoolsCount,
  totalUsers,
  usersWithSchools,
  usersWithoutSchools,
  schoolsLoading,
  usersLoading,
  schoolsRefetching,
  usersRefetching
}) => {
  const systemOverviewCards = [
    {
      title: "Total Schools",
      value: schoolsCount,
      description: "Active school tenants",
      icon: Building2,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up" as const,
      loading: schoolsLoading || schoolsRefetching
    },
    {
      title: "Total Users",
      value: totalUsers,
      description: "Across all schools",
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      change: "+8%",
      trend: "up" as const,
      loading: usersLoading || usersRefetching
    },
    {
      title: "Users Assigned",
      value: usersWithSchools,
      description: "Users linked to schools",
      icon: CheckCircle,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+15%",
      trend: "up" as const,
      loading: usersLoading || usersRefetching
    },
    {
      title: "Unassigned Users",
      value: usersWithoutSchools,
      description: "Need school assignment",
      icon: Activity,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      change: "-5%",
      trend: "down" as const,
      loading: usersLoading || usersRefetching
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {systemOverviewCards.map((card, index) => (
        <Card key={index} className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-40`}></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md bg-gradient-to-r ${card.gradient} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                <card.icon className="h-3.5 w-3.5 text-white" />
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
              <p className="text-lg font-bold text-gray-900">
                {card.loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  card.value
                )}
              </p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemOverviewCards;
