
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useUpdateProject, Project } from '@/hooks/useProjects';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({ project, open, onClose }) => {
  const updateProjectMutation = useUpdateProject();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    defaultValues: {
      project_name: project.project_name,
      description: project.description || '',
      project_type: project.project_type,
      responsible_person: project.responsible_person,
      responsible_person_email: project.responsible_person_email || '',
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      progress: project.progress,
      priority: project.priority,
      budget: project.budget,
      actual_cost: project.actual_cost,
      notes: project.notes || '',
      attachments: project.attachments || []
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        ...data
      });
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                {...register('project_name', { required: 'Project name is required' })}
                placeholder="Enter project name"
              />
              {errors.project_name && (
                <p className="text-sm text-red-600">{errors.project_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type *</Label>
              <Select
                value={watch('project_type')}
                onValueChange={(value) => setValue('project_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">School Event</SelectItem>
                  <SelectItem value="trip">Academic Trip</SelectItem>
                  <SelectItem value="campaign">Marketing Campaign</SelectItem>
                  <SelectItem value="internal">Internal Project</SelectItem>
                  <SelectItem value="client">Client Project</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible_person">Responsible Person *</Label>
              <Input
                id="responsible_person"
                {...register('responsible_person', { required: 'Responsible person is required' })}
                placeholder="Enter responsible person name"
              />
              {errors.responsible_person && (
                <p className="text-sm text-red-600">{errors.responsible_person.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_person_email">Contact Email</Label>
              <Input
                id="responsible_person_email"
                type="email"
                {...register('responsible_person_email')}
                placeholder="Enter contact email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date', { required: 'Start date is required' })}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date', { required: 'End date is required' })}
              />
              {errors.end_date && (
                <p className="text-sm text-red-600">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                {...register('progress', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Progress must be at least 0%' },
                  max: { value: 100, message: 'Progress cannot exceed 100%' }
                })}
              />
              {errors.progress && (
                <p className="text-sm text-red-600">{errors.progress.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                {...register('budget', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_cost">Actual Cost ($)</Label>
              <Input
                id="actual_cost"
                type="number"
                min="0"
                step="0.01"
                {...register('actual_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
