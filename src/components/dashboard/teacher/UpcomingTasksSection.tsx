
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TaskData {
  task: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

interface UpcomingTasksSectionProps {
  tasks: TaskData[];
}

const UpcomingTasksSection = ({ tasks }: UpcomingTasksSectionProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Tasks
        </CardTitle>
        <CardDescription>
          Your pending tasks and deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getPriorityIcon(task.priority)}
                <div>
                  <p className="font-medium">{task.task}</p>
                  <p className="text-sm text-gray-600">{task.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{task.dueDate}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasksSection;
