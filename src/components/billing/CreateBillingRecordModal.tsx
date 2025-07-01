
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBillingActions } from '@/hooks/useBillingManagement';
import { Building2, DollarSign, Calendar, Loader2 } from 'lucide-react';

interface CreateBillingRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBillingRecordModal: React.FC<CreateBillingRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createSetupFees, createMonthlySubscriptions } = useBillingActions();

  const handleCreateSetupFees = async () => {
    try {
      await createSetupFees.mutateAsync();
      onSuccess();
    } catch (error) {
      console.error('Failed to create setup fees:', error);
    }
  };

  const handleCreateMonthlySubscriptions = async () => {
    try {
      await createMonthlySubscriptions.mutateAsync();
      onSuccess();
    } catch (error) {
      console.error('Failed to create monthly subscriptions:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Billing Records</DialogTitle>
          <DialogDescription>
            Generate billing records for schools. Choose the type of billing to create.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Setup Fees
              </CardTitle>
              <CardDescription>
                Create one-time setup fees for schools that don't have them yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>KES 15,000 per school</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due in 30 days</span>
              </div>
              <Button 
                onClick={handleCreateSetupFees}
                disabled={createSetupFees.isPending}
                className="w-full"
              >
                {createSetupFees.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Setup Fees'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                Monthly Subscriptions
              </CardTitle>
              <CardDescription>
                Create monthly subscription fees for all active schools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>KES 2,500 per school</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due 5th of next month</span>
              </div>
              <Button 
                onClick={handleCreateMonthlySubscriptions}
                disabled={createMonthlySubscriptions.isPending}
                className="w-full"
                variant="outline"
              >
                {createMonthlySubscriptions.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Monthly Fees'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBillingRecordModal;
