
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Eye, Edit } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import EditProjectDialog from './EditProjectDialog';
import ProjectDetailsDialog from './ProjectDetailsDialog';

const ProjectsTimeline: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  // Sort projects by start date
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (endDate: string, status: string) => {
    return getDaysRemaining(endDate) < 0 && status !== 'completed' && status !== 'cancelled';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Timeline View</h3>
          <p className="text-sm text-muted-foreground">Loading timeline...</p>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Timeline View</h3>
        <p className="text-sm text-muted-foreground">
          Projects organized by timeline ({sortedProjects.length} total)
        </p>
      </div>

      <div className="space-y-6">
        {sortedProjects.map((project, index) => {
          const daysRemaining = getDaysRemaining(project.end_date);
          const overdue = isOverdue(project.end_date, project.status);
          
          return (
            <div key={project.id} className="relative">
              {/* Timeline line */}
              {index < sortedProjects.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-4 top-8 w-4 h-4 rounded-full border-2 ${
                project.status === 'completed' ? 'bg-green-500 border-green-500' :
                project.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                overdue ? 'bg-red-500 border-red-500' :
                'bg-gray-300 border-gray-300'
              }`}></div>

              <Card className={`ml-12 hover:shadow-lg transition-shadow ${
                overdue ? 'border-red-200 bg-red-50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{project.project_name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingProject(project)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Timeline Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span>{new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          {new Date(project.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {daysRemaining > 0 ? `${daysRemaining} days left` :
                           daysRemaining === 0 ? 'Due today' :
                           project.status === 'completed' ? 'Completed' :
                           `${Math.abs(daysRemaining)} days overdue`}
                        </span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Lead:</span>
                        <span>{project.responsible_person}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {project.project_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge className={`text-xs ${
                          project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          project.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress and Budget */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {project.budget > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Budget: </span>
                          <span className="font-medium">${project.budget.toLocaleString()}</span>
                          {project.actual_cost > 0 && (
                            <div className="text-muted-foreground">
                              Spent: ${project.actual_cost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects to display</h3>
          <p className="text-muted-foreground">
            Create your first project to see it on the timeline.
          </p>
        </div>
      )}

      {/* Dialogs */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {viewingProject && (
        <ProjectDetailsDialog
          project={viewingProject}
          open={!!viewingProject}
          onClose={() => setViewingProject(null)}
        />
      )}
    </div>
  );
};

export default ProjectsTimeline;
