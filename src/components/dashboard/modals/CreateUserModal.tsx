
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
  initialRole?: string;
}

interface CreateUserRpcResponse {
  success?: boolean;
  error?: string;
  user_id?: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  initialRole = 'parent'
}) => {
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    email: '',
    password: 'TempPassword123!',
    name: '',
    role: initialRole,
    schoolId: currentUser.school_id || ''
  });

  // Get available schools for selection
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isOpen && currentUser.role === 'edufam_admin'
  });

  const createUserMutation = useMutation({
    mutationFn: async (user: typeof userData) => {
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: user.email,
        user_password: user.password,
        user_name: user.name,
        user_role: user.role,
        user_school_id: user.schoolId || null
      });
      
      if (error) throw error;
      return data as CreateUserRpcResponse;
    },
    onSuccess: (result) => {
      if (result && result.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        onSuccess();
        onClose();
        setUserData({
          email: '',
          password: 'TempPassword123!',
          name: '',
          role: initialRole,
          schoolId: currentUser.school_id || ''
        });
      } else {
        throw new Error(result?.error || 'Failed to create user');
      }
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(userData);
  };

  const roleOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'principal', label: 'Principal' },
    { value: 'school_owner', label: 'School Owner' },
    { value: 'finance_officer', label: 'Finance Officer' },
    ...(currentUser.role === 'edufam_admin' ? [
      { value: 'edufam_admin', label: 'EduFam Admin' }
    ] : [])
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with the specified role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select 
              value={userData.role} 
              onValueChange={(value) => setUserData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School selection - only for system admins or when role requires school */}
          {(currentUser.role === 'edufam_admin' && userData.role !== 'edufam_admin') && (
            <div>
              <Label htmlFor="school">School</Label>
              <Select 
                value={userData.schoolId} 
                onValueChange={(value) => setUserData(prev => ({ ...prev, schoolId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              value={userData.password}
              onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter temporary password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The user will be prompted to change this password on first login.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createUserMutation.isPending}
              className="flex-1"
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
