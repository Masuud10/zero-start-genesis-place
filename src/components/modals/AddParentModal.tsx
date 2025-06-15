import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface AddParentModalProps {
  open: boolean;
  onClose: () => void;
  onParentCreated: (parent: { id: string, name: string, email: string }) => void;
}

const AddParentModal: React.FC<AddParentModalProps> = ({ open, onClose, onParentCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // FIX: Generate a new UUID for the parent profile.
      const newId = uuidv4();
      // Insert must include id, name, email, role, and other required fields for profiles table.
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: newId,
          name: form.name,
          email: form.email,
          role: 'parent',
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Parent Created", description: `${form.name} was added.` });
      onParentCreated({ id: data.id, name: data.name, email: data.email });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Parent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Parent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddParentModal;
