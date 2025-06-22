
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserActivationToggle from './UserActivationToggle';
import { Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  school_id?: string;
  phone?: string;
  school?: {
    name: string;
  };
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onUserUpdated: () => void;
}

const UsersTable = ({ users, loading, error, onRetry, onUserUpdated }: UsersTableProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'edufam_admin':
      case 'elimisha_admin':
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'edufam_admin':
        return 'EduFam Admin';
      case 'elimisha_admin':
        return 'Elimisha Admin';
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'finance_officer':
        return 'Finance Officer';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-y-4 flex-col">
            <AlertTriangle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800">Failed to Load Users</h3>
              <p className="text-red-600 mt-2">{error}</p>
              <Button onClick={onRetry} className="mt-4" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No Users Found</h3>
            <p className="text-gray-500">No users match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.school?.name || (user.school_id ? 'Unknown School' : 'No School')}
                    </TableCell>
                    <TableCell>
                      <UserActivationToggle
                        userId={user.id}
                        userName={user.name}
                        currentStatus={user.status || 'active'}
                        userRole={user.role}
                        onStatusChanged={onUserUpdated}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* Additional actions can be added here */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersTable;
