
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Clock } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { format, differenceInDays, parseISO } from 'date-fns';
import { LoadingCard } from '@/components/common/LoadingStates';

const ProjectsTimeline = () => {
  const { data: projects = [], isLoading, error } = useProjects();

  // Sort projects by start date
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-green-300';
      case 'medium': return 'border-yellow-300';
      case 'high': return 'border-orange-300';
      case 'critical': return 'border-red-300';
      default: return 'border-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'School Event';
      case 'trip': return 'Academic Trip';
      case 'campaign': return 'Marketing Campaign';
      case 'internal': return 'Internal Project';
      case 'client': return 'Client Project';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(parseISO(endDate), new Date());
    return days;
  };

  if (isLoading) {
    return <LoadingCard title="Loading timeline..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Error loading projects: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        <div className="space-y-8">
          {sortedProjects.map((project, index) => {
            const daysRemaining = getDaysRemaining(project.end_date);
            const isOverdue = daysRemaining < 0 && project.status !== 'completed';
            
            return (
              <div key={project.id} className="relative flex items-start gap-6">
                {/* Timeline dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${getPriorityColor(project.priority)} bg-white`}>
                  {project.status === 'completed' && (
                    <div className="absolute inset-1 bg-green-500 rounded-full"></div>
                  )}
                </div>

                {/* Project card */}
                <Card className={`flex-1 ${isOverdue ? 'border-red-300' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{project.project_name}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(project.project_type)}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {daysRemaining > 0 ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {daysRemaining} days left
                          </div>
                        ) : daysRemaining === 0 ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="h-4 w-4" />
                            Due today
                          </div>
                        ) : project.status === 'completed' ? (
                          <div className="text-green-600">Completed</div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <Clock className="h-4 w-4" />
                            {Math.abs(daysRemaining)} days overdue
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Start</div>
                          <div className="text-gray-600">
                            {format(new Date(project.start_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">End</div>
                          <div className="text-gray-600">
                            {format(new Date(project.end_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Responsible</div>
                          <div className="text-gray-600 truncate">
                            {project.responsible_person}
                          </div>
                        </div>
                      </div>
                    </div>

                    {project.budget > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Budget: ${project.budget.toLocaleString()}</span>
                          {project.actual_cost > 0 && (
                            <span>Spent: ${project.actual_cost.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {sortedProjects.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No projects to display in timeline.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectsTimeline;
