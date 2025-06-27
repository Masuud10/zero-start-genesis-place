
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface TimetableStatsProps {
  totalSchedules: number;
  publishedSchedules: number;
  conflictsCount: number;
}

const TimetableStats: React.FC<TimetableStatsProps> = ({
  totalSchedules,
  publishedSchedules,
  conflictsCount
}) => {
  const unpublishedSchedules = totalSchedules - publishedSchedules;
  const publishedPercentage = totalSchedules > 0 ? (publishedSchedules / totalSchedules) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Total Schedules</p>
              <p className="text-2xl font-bold text-blue-900">{totalSchedules}</p>
              <p className="text-xs text-blue-600">
                {totalSchedules === 0 ? 'No schedules' : 'All periods'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Published</p>
              <p className="text-2xl font-bold text-green-900">{publishedSchedules}</p>
              <p className="text-xs text-green-600">
                {publishedPercentage.toFixed(0)}% of total
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          {publishedSchedules > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                Active timetables
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${
        conflictsCount > 0 
          ? 'from-red-50 to-red-100 border-red-200' 
          : 'from-gray-50 to-gray-100 border-gray-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                conflictsCount > 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                Conflicts
              </p>
              <p className={`text-2xl font-bold ${
                conflictsCount > 0 ? 'text-red-900' : 'text-gray-900'
              }`}>
                {conflictsCount}
              </p>
              <p className={`text-xs ${
                conflictsCount > 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {conflictsCount === 0 ? 'No conflicts' : 'Need resolution'}
              </p>
            </div>
            {conflictsCount > 0 ? (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-gray-400" />
            )}
          </div>
          {conflictsCount > 0 && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Requires attention
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableStats;
