
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpcomingTask {
  task: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

interface UpcomingTasksSectionProps {
  tasks: UpcomingTask[];
}

const UpcomingTasksSection: React.FC<UpcomingTasksSectionProps> = ({ tasks }) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📋</span>
          <span>Upcoming Tasks</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                </div>
              </div>
              <Badge variant={
                task.priority === 'high' ? 'destructive' :
                task.priority === 'medium' ? 'secondary' : 'default'
              }>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksSection;
