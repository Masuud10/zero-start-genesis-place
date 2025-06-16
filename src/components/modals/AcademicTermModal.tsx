
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AcademicTermModalProps {
  open: boolean;
  onClose: () => void;
  onTermCreated: () => void;
}

const AcademicTermModal: React.FC<AcademicTermModalProps> = ({ open, onClose, onTermCreated }) => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    term_name: '',
    start_date: '',
    end_date: '',
    academic_year_id: '',
  });

  const { data: academicYears } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase.from('academic_years').select('*').eq('school_id', schoolId!);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId && open,
  });

  const { mutate: createAcademicTerm, isPending } = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('academic_terms').insert({
        school_id: schoolId!,
        term_name: data.term_name,
        start_date: data.start_date,
        end_date: data.end_date,
        academic_year_id: data.academic_year_id,
        is_current: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Academic term created successfully." });
      queryClient.invalidateQueries({ queryKey: ['academicTerms', schoolId] });
      onTermCreated();
      onClose();
      setFormData({ term_name: '', start_date: '', end_date: '', academic_year_id: '' });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.term_name || !formData.start_date || !formData.end_date || !formData.academic_year_id) {
      toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    createAcademicTerm(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Academic Term</DialogTitle>
          <DialogDescription>Create a new academic term for your school.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="academic_year_id">Academic Year</Label>
            <Select value={formData.academic_year_id} onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>{year.year_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="term_name">Term Name</Label>
            <Input
              id="term_name"
              value={formData.term_name}
              onChange={(e) => setFormData(prev => ({ ...prev, term_name: e.target.value }))}
              placeholder="e.g., Term 1, First Semester"
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
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Term'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicTermModal;
