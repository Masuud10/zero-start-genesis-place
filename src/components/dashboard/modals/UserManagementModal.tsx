
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { SystemSettingsService } from '@/services/system/systemSettingsService';
import { Users, UserCheck, Clock, Loader2 } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserStats();
    }
  }, [isOpen]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const { data } = await SystemSettingsService.getUserManagementStats();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user management data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </DialogTitle>
          <DialogDescription>
            Overview of system users and management statistics
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700 mt-1">Recent Signups</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-900">
                {Object.keys(userStats?.users_by_role || {}).length}
              </div>
              <p className="text-sm text-orange-700 mt-1">User Roles</p>
            </div>
          </div>

          {/* Users by Role */}
          <div>
            <h4 className="font-medium mb-2">Users by Role</h4>
            <div className="space-y-3">
              {Object.entries(userStats?.users_by_role || {}).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{String(count)}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Alert>
            <UserCheck className="h-4 w-4" />
            <AlertDescription>
              User management statistics are updated in real-time. Create new users using the Administrative Hub.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={fetchUserStats} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
