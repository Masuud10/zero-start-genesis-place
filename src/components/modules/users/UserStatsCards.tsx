
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  school_id?: string;
  school?: {
    name: string;
  };
}

interface UserStatsCardsProps {
  users: User[];
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.length; // Assuming all listed users are active
  const schoolUsers = users.filter(user => user.school_id).length;
  const adminUsers = users.filter(user => ['elimisha_admin', 'edufam_admin'].includes(user.role)).length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'School Users',
      value: schoolUsers,
      icon: School,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'System Admins',
      value: adminUsers,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStatsCards;
