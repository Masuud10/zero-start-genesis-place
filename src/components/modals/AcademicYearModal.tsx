
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface AcademicYearModalProps {
  open: boolean;
  onClose: () => void;
  onYearCreated: () => void;
}

const AcademicYearModal: React.FC<AcademicYearModalProps> = ({ open, onClose, onYearCreated }) => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    year_name: '',
    start_date: '',
    end_date: '',
  });

  const { mutate: createAcademicYear, isPending } = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('academic_years').insert({
        school_id: schoolId!,
        year_name: data.year_name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_current: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Academic year created successfully." });
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      onYearCreated();
      onClose();
      setFormData({ year_name: '', start_date: '', end_date: '' });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year_name || !formData.start_date || !formData.end_date) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    createAcademicYear(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Academic Year</DialogTitle>
          <DialogDescription>Create a new academic year for your school.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="year_name">Year Name</Label>
            <Input
              id="year_name"
              value={formData.year_name}
              onChange={(e) => setFormData(prev => ({ ...prev, year_name: e.target.value }))}
              placeholder="e.g., 2024-2025"
              required
            />
          </div>
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Year'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicYearModal;
