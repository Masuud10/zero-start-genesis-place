
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FeeStructure } from '@/types/finance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AssignFeeStructureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feeStructure: FeeStructure;
}

const AssignFeeStructureDialog: React.FC<AssignFeeStructureDialogProps> = ({ isOpen, onClose, feeStructure }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { classes, isLoading: isLoadingClasses, error: classesError } = useSchoolClasses();

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a class to assign the fee structure.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      const { error } = await supabase.functions.invoke('assign-fee-structure', {
        body: {
          fee_structure_id: feeStructure.id,
          class_id: selectedClassId,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Fee structure "${feeStructure.name}" assigned successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      onClose();
    } catch (error: any) {
      console.error('Error assigning fee structure:', error);
      toast({
        title: 'Assignment Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const dialogContent = useMemo(() => {
    if (isLoadingClasses) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Loading classes...</span></div>;
    }

    if (classesError) {
      return (
        <div className="flex items-center text-red-600 bg-red-50 p-4 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Error loading classes: {classesError}</p>
        </div>
      );
    }

    if (classes.length === 0) {
        return <p className="text-center text-muted-foreground py-4">No classes found for this school.</p>;
    }

    return (
      <div className="space-y-4 py-4">
        <p>
          You are about to assign the fee structure{' '}
          <strong className="font-semibold">{feeStructure.name}</strong> to a class. This will generate fee records for all students in that class.
        </p>
        <Select onValueChange={setSelectedClassId} value={selectedClassId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }, [isLoadingClasses, classesError, classes, feeStructure, selectedClassId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Fee Structure to Class</DialogTitle>
          <DialogDescription>
            Select a class to apply this fee structure. This action cannot be easily undone.
          </DialogDescription>
        </DialogHeader>
        {dialogContent}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || !selectedClassId || isLoadingClasses}>
            {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Assign Structure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFeeStructureDialog;
