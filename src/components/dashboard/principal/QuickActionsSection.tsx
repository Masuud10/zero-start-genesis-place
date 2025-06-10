
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

interface QuickActionsSectionProps {
  actions: QuickAction[];
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ actions }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>Principal Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <button 
              key={index}
              onClick={action.action}
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-all duration-200 text-left w-full"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-sm">{action.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-base">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
