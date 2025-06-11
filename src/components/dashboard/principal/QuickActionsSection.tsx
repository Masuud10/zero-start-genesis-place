
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickActionCard from '../shared/QuickActionCard';

interface QuickActionsSectionProps {
  actions: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    action: () => void;
  }>;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ actions }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={action.action}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
