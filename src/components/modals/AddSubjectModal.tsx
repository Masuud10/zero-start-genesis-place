
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubjectCreated: () => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ open, onClose, onSubjectCreated }) => {
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectName.trim() || !subjectCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields: Subject Name and Code.",
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
        .from('subjects')
        .insert([{
          name: subjectName.trim(),
          code: subjectCode.trim(),
          school_id: schoolId,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subject created successfully",
      });

      handleClose();
      onSubjectCreated();

    } catch (error: any) {
      console.error('Error creating subject:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubjectName('');
    setSubjectCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input
              id="subjectName"
              type="text"
              placeholder="e.g., Mathematics, English"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectCode">Subject Code</Label>
            <Input
              id="subjectCode"
              type="text"
              placeholder="e.g., MATH101, ENG202"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal;
