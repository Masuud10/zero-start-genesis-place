
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Crown, GraduationCap, Book, Calculator, Heart, RefreshCw } from 'lucide-react';

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
  const roleConfig = {
    'edufam_admin': { icon: Crown, label: 'EduFam Admin', color: 'text-purple-600' },
    'elimisha_admin': { icon: Crown, label: 'Elimisha Admin', color: 'text-indigo-600' },
    'school_owner': { icon: UserCheck, label: 'School Owner', color: 'text-blue-600' },
    'principal': { icon: GraduationCap, label: 'Principal', color: 'text-green-600' },
    'teacher': { icon: Book, label: 'Teacher', color: 'text-orange-600' },
    'finance_officer': { icon: Calculator, label: 'Finance Officer', color: 'text-emerald-600' },
    'parent': { icon: Heart, label: 'Parent', color: 'text-pink-600' },
  };

  const roleEntries = Object.entries(roleBreakdown || {})
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const calculatePercentage = (count: number) => {
    if (totalUsers === 0) return 0;
    return Math.round((count / totalUsers) * 100);
  };

  if (usersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Breakdown
            <RefreshCw className="h-4 w-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {roleEntries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">
              No user data available to display role breakdown.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>Total Users: <span className="font-medium text-gray-900">{totalUsers}</span></div>
              <div>Active Roles: <span className="font-medium text-gray-900">{roleEntries.length}</span></div>
            </div>
            
            <div className="space-y-3">
              {roleEntries.map(([role, count]) => {
                const config = roleConfig[role] || { 
                  icon: Users, 
                  label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '), 
                  color: 'text-gray-600' 
                };
                const IconComponent = config.icon;
                const percentage = calculatePercentage(count);

                return (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                      <span className="font-medium text-gray-900">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bars for visual representation */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution</h4>
              <div className="space-y-2">
                {roleEntries.slice(0, 5).map(([role, count]) => {
                  const config = roleConfig[role] || { label: role, color: 'text-gray-600' };
                  const percentage = calculatePercentage(count);
                  
                  return (
                    <div key={role} className="flex items-center gap-3 text-sm">
                      <div className="w-20 text-right text-gray-600">{config.label}:</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleBreakdown;
