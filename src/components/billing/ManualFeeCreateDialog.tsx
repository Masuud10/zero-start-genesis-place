
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useBillingActions } from '@/hooks/useEnhancedBilling';
import { useSchools } from '@/hooks/useSchools';

interface ManualFeeFormData {
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  description: string;
  due_date: string;
}

const ManualFeeCreateDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<ManualFeeFormData>();
  const { createManualFee } = useBillingActions();
  const { data: schools, isLoading: schoolsLoading } = useSchools();

  const billingType = watch('billing_type');

  const onSubmit = async (data: ManualFeeFormData) => {
    try {
      await createManualFee.mutateAsync(data);
      reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to create manual fee:', error);
    }
  };

  const handleBillingTypeChange = (value: string) => {
    setValue('billing_type', value as 'setup_fee' | 'subscription_fee');
    
    // Set default amounts based on billing type
    if (value === 'setup_fee') {
      setValue('amount', 5000);
      setValue('description', 'School Setup Fee - One-time registration fee');
    } else if (value === 'subscription_fee') {
      setValue('amount', 0);
      setValue('description', 'Monthly Subscription Fee - Per student billing');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Manual Fee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Manual Fee Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school_id">School</Label>
              <Select onValueChange={(value) => setValue('school_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schoolsLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading schools...
                    </SelectItem>
                  ) : (
                    schools?.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="billing_type">Billing Type</Label>
              <Select onValueChange={handleBillingTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select billing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="setup_fee">Setup Fee</SelectItem>
                  <SelectItem value="subscription_fee">Subscription Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { 
                  required: true, 
                  min: 0,
                  valueAsNumber: true 
                })}
              />
              {billingType === 'setup_fee' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Default: KES 5,000 (one-time fee)
                </p>
              )}
              {billingType === 'subscription_fee' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Will be calculated based on student count
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date', { required: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter fee description..."
              {...register('description', { required: true })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createManualFee.isPending}
            >
              {createManualFee.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Fee Record'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualFeeCreateDialog;
