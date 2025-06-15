
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Users, UserCheck, UserX, RefreshCw } from 'lucide-react';

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
  const isLoading = schoolsLoading || usersLoading;
  const isRefetching = schoolsRefetching || usersRefetching;

  const cards = [
    {
      title: 'Total Schools',
      value: schoolsCount,
      icon: School,
      description: 'Active schools in system',
      loading: schoolsLoading || schoolsRefetching,
      color: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'All registered users',
      loading: usersLoading || usersRefetching,
      color: 'text-green-600'
    },
    {
      title: 'Users with Schools',
      value: usersWithSchools,
      icon: UserCheck,
      description: 'Users assigned to schools',
      loading: usersLoading || usersRefetching,
      color: 'text-emerald-600'
    },
    {
      title: 'Unassigned Users',
      value: usersWithoutSchools,
      icon: UserX,
      description: 'Users without school assignment',
      loading: usersLoading || usersRefetching,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="relative">
                <IconComponent className={`h-4 w-4 ${card.color}`} />
                {card.loading && (
                  <RefreshCw className="h-3 w-3 absolute -top-1 -right-1 animate-spin text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {card.loading ? (
                    <div className="text-2xl font-bold text-gray-400">
                      <RefreshCw className="h-6 w-6 animate-spin inline" />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">
                      {typeof card.value === 'number' ? card.value.toLocaleString() : '0'}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemOverviewCards;
