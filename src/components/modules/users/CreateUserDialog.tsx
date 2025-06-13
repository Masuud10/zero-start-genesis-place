
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminUserService } from '@/services/adminUserService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateUserDialogProps {
  onUserCreated: () => void;
  children?: React.ReactNode;
}

interface School {
  id: string;
  name: string;
}

interface UserPermissions {
  canCreateUsers: boolean;
  userRole: string | null;
  schoolId: string | null;
  isSystemAdmin?: boolean;
  isSchoolAdmin?: boolean;
}

const CreateUserDialog = ({ onUserCreated, children }: CreateUserDialogProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreateUsers: false,
    userRole: null,
    schoolId: null
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    school_id: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isCreateDialogOpen) {
      loadUserPermissions();
      generateRandomPassword();
    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (permissions.isSystemAdmin && isCreateDialogOpen) {
      fetchSchools();
    }
  }, [permissions.isSystemAdmin, isCreateDialogOpen]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  const loadUserPermissions = async () => {
    try {
      const userPermissions = await AdminUserService.getCurrentUserPermissions();
      setPermissions(userPermissions);
      
      // Pre-fill school_id for school admins
      if (userPermissions.isSchoolAdmin && userPermissions.schoolId) {
        setNewUser(prev => ({ ...prev, school_id: userPermissions.schoolId! }));
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive",
      });
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
    }
  };

  const getAvailableRoles = () => {
    if (permissions.isSystemAdmin) {
      return [
        { value: 'elimisha_admin', label: 'Elimisha Admin' },
        { value: 'edufam_admin', label: 'EduFam Admin' },
        { value: 'school_owner', label: 'School Owner' },
        { value: 'principal', label: 'Principal' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'parent', label: 'Parent' },
        { value: 'finance_officer', label: 'Finance Officer' }
      ];
    } else if (permissions.isSchoolAdmin) {
      return [
        { value: 'teacher', label: 'Teacher' },
        { value: 'parent', label: 'Parent' },
        { value: 'finance_officer', label: 'Finance Officer' }
      ];
    }
    return [];
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // For school-level roles, ensure school is selected (unless it's pre-filled)
    if (shouldShowSchoolSelector() && !newUser.school_id) {
      toast({
        title: "Error",
        description: "Please select a school for this user",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('Creating user with credentials:', {
        email: newUser.email,
        role: newUser.role,
        school_id: newUser.school_id || permissions.schoolId
      });

      const result = await AdminUserService.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        school_id: newUser.school_id || permissions.schoolId || undefined
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      // If creating a principal, update the school's principal_id
      if (newUser.role === 'principal' && (newUser.school_id || permissions.schoolId) && result.user_id) {
        const schoolId = newUser.school_id || permissions.schoolId;
        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({ principal_id: result.user_id })
          .eq('id', schoolId);

        if (schoolUpdateError) {
          console.error('Error updating school principal:', schoolUpdateError);
        }
      }

      toast({
        title: "Success",
        description: `User created successfully! Email: ${newUser.email} | Password: ${newUser.password}`,
        duration: 8000,
      });

      setIsCreateDialogOpen(false);
      setNewUser({ name: '', email: '', role: '', password: '', school_id: '' });
      
      setTimeout(() => {
        onUserCreated();
      }, 1000);

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowSchoolSelector = () => {
    if (permissions.isSystemAdmin && ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'].includes(newUser.role)) {
      return true;
    }
    return false;
  };

  const availableRoles = getAvailableRoles();

  if (!permissions.canCreateUsers) {
    return null;
  }

  const TriggerComponent = children || (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create User
    </Button>
  );

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account with login credentials and school assignment
          </DialogDescription>
        </DialogHeader>

        {permissions.isSchoolAdmin && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Users will be automatically assigned to your school.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {shouldShowSchoolSelector() && (
            <div>
              <Label htmlFor="school">School *</Label>
              <Select value={newUser.school_id} onValueChange={(value) => setNewUser({ ...newUser, school_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateRandomPassword}
                className="text-xs"
              >
                Generate New
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button onClick={handleCreateUser} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
