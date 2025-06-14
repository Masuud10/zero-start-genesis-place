
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, RefreshCw } from 'lucide-react';

interface UserRoleBreakdownProps {
  roleBreakdown: Record<string, number>;
  totalUsers: number;
  usersLoading: boolean;
}

const UserRoleBreakdown: React.FC<UserRoleBreakdownProps> = ({
  roleBreakdown,
  totalUsers,
  usersLoading
}) => {
  if (totalUsers === 0) {
    return null;
  }

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
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
            <Users className="h-4 w-4 text-white" />
          </div>
          User Role Distribution
          {usersLoading && <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />}
        </CardTitle>
        <CardDescription>
          Active user breakdown across all educational institutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(roleBreakdown).map(([role, count], index) => (
            <div key={role} className={`text-center p-4 bg-gradient-to-br ${bgGradients[index % 4]} rounded-lg hover:shadow-md transition-all duration-200 group border`}>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${gradients[index % 4]} w-fit mx-auto mb-2 group-hover:scale-105 transition-transform duration-200`}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">{count as number}</p>
              <p className="text-xs text-gray-600 capitalize font-medium">{role.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleBreakdown;
