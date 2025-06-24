
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, MoreVertical, Eye, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/hooks/useProjects';
import EditProjectDialog from './EditProjectDialog';
import ProjectDetailsDialog from './ProjectDetailsDialog';

const ProjectsKanban: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  const statusColumns = [
    { key: 'planning', title: 'Planning', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'in_progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
    { key: 'on_hold', title: 'On Hold', color: 'bg-gray-50 border-gray-200' },
    { key: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
    { key: 'cancelled', title: 'Cancelled', color: 'bg-red-50 border-red-200' }
  ];

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statusColumns.map((column) => (
          <div key={column.key} className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Kanban Board</h3>
        <p className="text-sm text-muted-foreground">
          Visualize project progress across different stages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto">
        {statusColumns.map((column) => {
          const columnProjects = getProjectsByStatus(column.key);
          
          return (
            <div key={column.key} className="min-w-[280px]">
              <Card className={`${column.color} border-2`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex justify-between items-center">
                    {column.title}
                    <Badge variant="secondary" className="text-xs">
                      {columnProjects.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="space-y-3 mt-4">
                {columnProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm line-clamp-2">
                          {project.project_name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingProject(project)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingProject(project)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex gap-1">
                        <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {project.project_type.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">
                            {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="truncate">{project.responsible_person}</span>
                        </div>
                      </div>

                      {project.budget > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Budget: </span>
                          <span className="font-medium">${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {columnProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No projects in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

export default ProjectsKanban;
