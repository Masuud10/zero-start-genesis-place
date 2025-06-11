
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivityItem from '../shared/ActivityItem';

interface FinancialActivity {
  action: string;
  amount: string;
  time: string;
  type: 'income' | 'expense';
}

interface FinancialActivitiesSectionProps {
  activities: FinancialActivity[];
}

const FinancialActivitiesSection: React.FC<FinancialActivitiesSectionProps> = ({ activities }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>💸</span>
          <span>Recent Financial Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
              <ActivityItem
                action={activity.action}
                time={activity.time}
                type={activity.type}
                amount={activity.amount}
              />
              <Badge variant={activity.type === 'income' ? 'default' : 'destructive'}>
                {activity.type === 'income' ? '+' : '-'}{activity.amount}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialActivitiesSection;
