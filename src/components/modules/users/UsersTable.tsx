
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  school_id?: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
}

const UsersTable = ({ users, loading }: UsersTableProps) => {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      elimisha_admin: { variant: 'destructive' as const, label: 'Elimisha Admin' },
      edufam_admin: { variant: 'destructive' as const, label: 'EduFam Admin' },
      school_owner: { variant: 'default' as const, label: 'School Owner' },
      principal: { variant: 'default' as const, label: 'Principal' },
      teacher: { variant: 'secondary' as const, label: 'Teacher' },
      parent: { variant: 'outline' as const, label: 'Parent' },
      finance_officer: { variant: 'secondary' as const, label: 'Finance Officer' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { variant: 'outline' as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Directory</CardTitle>
        <CardDescription>
          All registered users in the Elimisha platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading users...</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersTable;
