
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Loader2, UserPlus } from 'lucide-react';

interface AddTeacherModalProps {
  open: boolean;
  onClose: () => void;
  onTeacherCreated?: (teacher: { id: string, name: string, email: string }) => void;
}

interface CreateUserRpcResponse {
  error?: string;
  success?: boolean;
  user_id?: string;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ open, onClose, onTeacherCreated }) => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({ 
        title: "Error", 
        description: "School context not found", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      // Use the edge function to create teacher with proper auth setup
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email,
          password: 'TempPassword123!', // Temporary password
          name: form.name,
          role: 'teacher',
          school_id: schoolId
        }
      });

      if (error) throw error;

      // Type the response data properly
      const responseData = data as CreateUserRpcResponse;

      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      toast({ 
        title: "Teacher Created", 
        description: `${form.name} has been added as a teacher. They will receive login credentials separately.` 
      });
      
      onTeacherCreated && onTeacherCreated({ 
        id: responseData.user_id || '', 
        name: form.name, 
        email: form.email 
      });
      
      setForm({ name: '', email: '' });
      onClose();
    } catch (err: any) {
      console.error('Error creating teacher:', err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to create teacher", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Teacher
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teacher-name">Full Name</Label>
            <Input 
              id="teacher-name"
              value={form.name} 
              onChange={e => handleChange('name', e.target.value)} 
              placeholder="Enter teacher's full name"
              required 
            />
          </div>
          <div>
            <Label htmlFor="teacher-email">Email Address</Label>
            <Input 
              id="teacher-email"
              type="email" 
              value={form.email} 
              onChange={e => handleChange('email', e.target.value)} 
              placeholder="Enter teacher's email"
              required 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Teacher
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherModal;
