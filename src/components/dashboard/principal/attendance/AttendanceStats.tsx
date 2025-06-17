
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserCheck, AlertCircle } from 'lucide-react';

interface AttendanceStatsProps {
  present: number;
  absent: number;
  total: number;
  rate: number;
}

const AttendanceStats = ({ present, absent, total, rate }: AttendanceStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Present Today</p>
            <p className="text-2xl font-bold text-green-700">{present}</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Absent Today</p>
            <p className="text-2xl font-bold text-red-700">{absent}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-700">{rate.toFixed(1)}%</p>
          </div>
          <Badge variant={rate > 90 ? "default" : "secondary"}>
            {rate > 90 ? "Excellent" : "Needs Attention"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;
