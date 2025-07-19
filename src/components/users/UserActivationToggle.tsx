
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserStatusService } from '@/services/system/userStatusService';
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
  userEmail?: string;
  onStatusChanged?: () => void;
}

const UserActivationToggle = ({ 
  userId, 
  userName, 
  currentStatus, 
  userRole,
  userEmail,
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
      const oldStatus = isActive ? 'active' : 'inactive';
      
      // Log the action attempt for audit purposes
      await UserStatusService.logUserStatusChange(userId, oldStatus, newStatus, {
        email: userEmail,
        name: userName
      });
      
      const result = await UserStatusService.updateUserStatus(userId, newStatus);

      if (result.success) {
        toast({
          title: "User Status Updated",
          description: `${userName} has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
        });

        if (onStatusChanged) onStatusChanged();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update user status",
          variant: "destructive",
        });
      }

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
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          System Admin
        </span>
      </div>
    );
  }

  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Switch
            checked={isActive}
            disabled={isUpdating}
            onCheckedChange={() => setShowConfirmDialog(true)}
          />
          <span className={`text-sm font-medium ${
            isActive ? 'text-green-600' : 'text-red-600'
          }`}>
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
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong className="text-yellow-800">Warning:</strong> 
                <span className="text-yellow-700 ml-1">
                  Deactivating this user will immediately prevent them from logging in and accessing any system features. All active sessions will be terminated.
                </span>
              </div>
            )}
            {!isActive && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <strong className="text-green-800">Note:</strong>
                <span className="text-green-700 ml-1">
                  Activating this user will restore their access according to their assigned role and school.
                </span>
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
