
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useFees } from '@/hooks/useFees';
import { useEnhancedClasses } from '@/hooks/useEnhancedClasses';
import { useAcademicTerms } from '@/hooks/useAcademicTerms';

interface CreateFeeDialogProps {
  onSuccess?: () => void;
}

const CreateFeeDialog: React.FC<CreateFeeDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fee_name: '',
    amount: '',
    term_id: '',
    class_id: '',
    due_date: '',
    description: '',
  });

  const { createFee, loading } = useFees();
  const { classes } = useEnhancedClasses();
  const { academicTerms } = useAcademicTerms();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fee_name || !formData.amount || !formData.class_id || !formData.due_date) {
      return;
    }

    const result = await createFee({
      fee_name: formData.fee_name,
      amount: parseFloat(formData.amount),
      term_id: formData.term_id || undefined,
      class_id: formData.class_id,
      due_date: formData.due_date,
      description: formData.description || undefined,
    });

    if (result.data) {
      setFormData({
        fee_name: '',
        amount: '',
        term_id: '',
        class_id: '',
        due_date: '',
        description: '',
      });
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Fee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Fee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fee_name">Fee Name *</Label>
            <Input
              id="fee_name"
              value={formData.fee_name}
              onChange={(e) => setFormData({ ...formData, fee_name: e.target.value })}
              placeholder="e.g., Tuition, Library, Sports"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="class_id">Class *</Label>
            <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="term_id">Academic Term (Optional)</Label>
            <Select value={formData.term_id} onValueChange={(value) => setFormData({ ...formData, term_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {academicTerms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.term_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Fee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFeeDialog;
