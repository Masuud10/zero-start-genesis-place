
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserActivationToggleProps {
  userId: string;
  userName: string;
  currentStatus: string;
  userRole: string;
  onStatusChanged?: () => void;
}

const UserActivationToggle = ({ 
  userId, 
  userName, 
  currentStatus, 
  userRole,
  onStatusChanged 
}: UserActivationToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Prevent deactivation of EduFam Admin accounts
  const canToggle = userRole !== 'edufam_admin' && userRole !== 'elimisha_admin';
  const isActive = currentStatus === 'active';

  const handleStatusToggle = async () => {
    if (!canToggle) {
      toast({
        title: "Action Not Allowed",
        description: "Cannot deactivate system administrator accounts.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const newStatus = isActive ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Status Updated",
        description: `${userName} has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
      });

      if (onStatusChanged) onStatusChanged();

    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
    }
  };

  if (!canToggle) {
    return (
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground">System Admin</span>
      </div>
    );
  }

  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            disabled={isUpdating}
            onCheckedChange={() => setShowConfirmDialog(true)}
          />
          <span className="text-sm text-muted-foreground">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Deactivate' : 'Activate'} User Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {isActive ? 'deactivate' : 'activate'} {userName}'s account?
            {isActive && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Warning:</strong> Deactivating this user will prevent them from logging in and accessing any system features.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isUpdating ? 'Updating...' : (isActive ? 'Deactivate' : 'Activate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserActivationToggle;
