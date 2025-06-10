
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatItem {
  title: string;
  value: string;
  count: string;
  icon: string;
  color: string;
}

interface TodayStatsSectionProps {
  stats: StatItem[];
}

const TodayStatsSection: React.FC<TodayStatsSectionProps> = ({ stats }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📊</span>
          <span>Today's Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="relative overflow-hidden border rounded-lg p-4">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="text-xl">{stat.icon}</div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayStatsSection;
