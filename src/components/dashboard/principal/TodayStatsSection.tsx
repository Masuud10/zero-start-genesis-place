
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '../shared/StatsCard';

interface TodayStatsSectionProps {
  stats: Array<{
    title: string;
    value: string;
    count: string;
    icon: string;
    color: string;
  }>;
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
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.count}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayStatsSection;
