
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, DollarSign } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { LoadingCard } from '@/components/common/LoadingStates';

const ProjectsKanban = () => {
  const { data: projects = [], isLoading, error } = useProjects();

  const statusColumns = [
    { key: 'planning', title: 'Planning', color: 'bg-blue-50 border-blue-200' },
    { key: 'in_progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'on_hold', title: 'On Hold', color: 'bg-gray-50 border-gray-200' },
    { key: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
    { key: 'cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return <LoadingCard title="Loading kanban board..." />;
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {statusColumns.map((column) => {
        const columnProjects = projects.filter(project => project.status === column.key);
        
        return (
          <div key={column.key} className="space-y-4">
            <Card className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  {column.title}
                  <Badge variant="secondary">{columnProjects.length}</Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {columnProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <CardTitle className="text-base">{project.project_name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(project.project_type)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>
                          {format(new Date(project.end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{project.responsible_person}</span>
                      </div>
                      {project.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-gray-500" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnProjects.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-500">No projects</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsKanban;
