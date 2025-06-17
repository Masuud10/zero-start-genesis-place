
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface TimetableStatsProps {
  totalSchedules: number;
  publishedSchedules: number;
  conflictsCount: number;
}

const TimetableStats = ({ totalSchedules, publishedSchedules, conflictsCount }: TimetableStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Schedules</p>
            <p className="text-2xl font-bold text-blue-700">{totalSchedules}</p>
          </div>
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Published</p>
            <p className="text-2xl font-bold text-green-700">{publishedSchedules}</p>
          </div>
          <Badge variant={publishedSchedules > 0 ? "default" : "secondary"}>
            {publishedSchedules > 0 ? "Active" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Conflicts</p>
            <p className="text-2xl font-bold text-red-700">{conflictsCount}</p>
          </div>
          <Badge variant={conflictsCount === 0 ? "default" : "destructive"}>
            {conflictsCount === 0 ? "Clear" : "Attention Needed"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default TimetableStats;
