
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { useCreateProject, Project } from '@/hooks/useProjects';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

type ProjectFormData = {
  project_name: string;
  description: string;
  project_type: 'event' | 'trip' | 'campaign' | 'internal' | 'client' | 'other';
  responsible_person: string;
  responsible_person_email: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  notes: string;
};

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const createProjectMutation = useCreateProject();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProjectFormData>({
    defaultValues: {
      project_name: '',
      description: '',
      project_type: 'internal',
      responsible_person: '',
      responsible_person_email: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      notes: ''
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await createProjectMutation.mutateAsync({
        ...data,
        progress: 0,
        actual_cost: 0,
        attachments: []
      });
      
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
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
                onValueChange={(value: 'event' | 'trip' | 'campaign' | 'internal' | 'client' | 'other') => setValue('project_type', value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setValue('priority', value)}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
