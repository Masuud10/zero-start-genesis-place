
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface SystemHealthCardProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemHealthCard = ({ schoolsCount, usersCount }: SystemHealthCardProps) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Users className="w-5 h-5 text-indigo-600" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Active Schools</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {schoolsCount}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Total Users</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {usersCount}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">System Status</span>
            </div>
            <div className="text-sm font-medium text-orange-600">
              Healthy
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">Data Sync</span>
            </div>
            <div className="text-sm font-medium text-purple-600">
              Real-time
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
