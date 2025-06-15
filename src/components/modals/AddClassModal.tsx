
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface AddClassModalProps {
  open: boolean;
  onClose: () => void;
  onClassCreated: () => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ open, onClose, onClassCreated }) => {
  const [className, setClassName] = useState('');
  const [level, setLevel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!className.trim() || !level.trim() || !year.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields: Class Name, Level, and Year.",
        variant: "destructive",
      });
      return;
    }

    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school assignment found",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('classes')
        .insert([{
          name: className.trim(),
          school_id: schoolId,
          level: level.trim(),
          year: year.trim(),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      handleClose();
      onClassCreated();

    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClassName('');
    setLevel('');
    setYear('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              type="text"
              placeholder="e.g., Grade 5A, Form 1 Blue"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="text"
              placeholder="e.g., Grade 5, Form 1"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="text"
              placeholder="e.g., 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassModal;
