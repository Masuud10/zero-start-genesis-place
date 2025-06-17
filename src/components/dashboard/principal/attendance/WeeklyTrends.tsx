
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface WeeklyTrendsProps {
  improving: number;
  declining: number;
  stable: number;
}

const WeeklyTrends = ({ improving, declining, stable }: WeeklyTrendsProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Weekly Trends
      </h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{improving}</p>
          <p className="text-sm text-green-600">Improving</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-700">{stable}</p>
          <p className="text-sm text-gray-600">Stable</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-700">{declining}</p>
          <p className="text-sm text-red-600">Declining</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTrends;
