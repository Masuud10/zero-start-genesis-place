
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Mail, DollarSign, FileText, Clock } from 'lucide-react';
import { Project } from '@/hooks/useProjects';

interface ProjectDetailsDialogProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({ project, open, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.project_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-3">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority.toUpperCase()} PRIORITY
            </Badge>
            <Badge variant="outline">
              {project.project_type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{project.progress}% Complete</span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsible Person */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Responsible Person
              </h4>
              <p className="text-muted-foreground">{project.responsible_person}</p>
              {project.responsible_person_email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <a href={`mailto:${project.responsible_person_email}`} className="hover:underline">
                    {project.responsible_person_email}
                  </a>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Start:</span> {new Date(project.start_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">End:</span> {new Date(project.end_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {
                    Math.ceil(
                      (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )
                  } days
                </div>
              </div>
            </div>

            {/* Budget Information */}
            {project.budget > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spent:</span>
                    <span className="font-medium">${project.actual_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className={`font-medium ${
                      project.budget - project.actual_cost >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(project.budget - project.actual_cost).toLocaleString()}
                    </span>
                  </div>
                  {project.budget > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Budget Utilization</span>
                        <span>{Math.round((project.actual_cost / project.budget) * 100)}%</span>
                      </div>
                      <Progress value={(project.actual_cost / project.budget) * 100} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Timestamps */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Project History
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">{project.notes}</p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Attachments</h4>
              <div className="space-y-2">
                {project.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{attachment.name || `Attachment ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
