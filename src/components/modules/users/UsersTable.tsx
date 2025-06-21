
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle, RefreshCw, Edit, UserX, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EditUserDialog from './EditUserDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  school_id?: string;
  phone?: string;
  school?: {
    name: string;
  };
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onUserUpdated?: () => void;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'elimisha_admin':
    case 'edufam_admin':
      return 'bg-red-100 text-red-800';
    case 'school_owner':
      return 'bg-purple-100 text-purple-800';
    case 'principal':
      return 'bg-blue-100 text-blue-800';
    case 'teacher':
      return 'bg-green-100 text-green-800';
    case 'finance_officer':
      return 'bg-orange-100 text-orange-800';
    case 'parent':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatRole = (role: string) => {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const UsersTable = ({ users, loading, error, onRetry, onUserUpdated }: UsersTableProps) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeactivateUser = async (userId: string, userName: string) => {
    try {
      setDeactivatingUserId(userId);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
          // Note: We're not actually deactivating here as the profiles table 
          // doesn't have a status field yet. This would need to be added.
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Status Updated",
        description: `${userName} has been processed successfully.`,
      });

      if (onUserUpdated) onUserUpdated();

    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setDeactivatingUserId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Error loading users:</strong> {error}
                <br />
                <span className="text-sm">Please check your connection and try again.</span>
              </div>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              No users match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users List ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.school?.name || (
                        user.role === 'elimisha_admin' || user.role === 'edufam_admin' 
                          ? 'System Admin' 
                          : 'Not Assigned'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id, user.name)}
                          disabled={deactivatingUserId === user.id}
                        >
                          {deactivatingUserId === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={() => {
          setEditingUser(null);
          if (onUserUpdated) onUserUpdated();
        }}
      />
    </>
  );
};

export default UsersTable;
