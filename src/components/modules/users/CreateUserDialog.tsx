
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

interface School {
  id: string;
  name: string;
}

const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    school_id: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if current user is an admin who can assign schools
  const canAssignSchools = user?.role === 'elimisha_admin' || user?.role === 'edufam_admin';

  useEffect(() => {
    if (canAssignSchools && isCreateDialogOpen) {
      fetchSchools();
    }
  }, [canAssignSchools, isCreateDialogOpen]);

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

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // For school-level roles, require school assignment if admin is creating the user
    if (canAssignSchools && 
        ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'].includes(newUser.role) && 
        !newUser.school_id) {
      toast({
        title: "Error",
        description: "Please select a school for this user",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('Creating user with school assignment:', {
        email: newUser.email,
        role: newUser.role,
        school_id: newUser.school_id
      });

      // Create user account in Supabase Auth with school assignment
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role,
            school_id: newUser.school_id || null
          }
        }
      });

      if (authError) throw authError;

      // If creating a principal, update the school's principal_id
      if (newUser.role === 'principal' && newUser.school_id && authData.user) {
        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({ principal_id: authData.user.id })
          .eq('id', newUser.school_id);

        if (schoolUpdateError) {
          console.error('Error updating school principal:', schoolUpdateError);
          // Don't throw here as user creation was successful
        }
      }

      toast({
        title: "Success",
        description: `User created successfully and linked to selected school. They will receive a confirmation email.`,
      });

      setIsCreateDialogOpen(false);
      setNewUser({ name: '', email: '', role: '', password: '', school_id: '' });
      
      // Refresh users list after a short delay
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

  const roleRequiresSchool = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer'].includes(newUser.role);

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account for the Elimisha platform
          </DialogDescription>
        </DialogHeader>
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
                {canAssignSchools && (
                  <>
                    <SelectItem value="elimisha_admin">Elimisha Admin</SelectItem>
                    <SelectItem value="edufam_admin">EduFam Admin</SelectItem>
                  </>
                )}
                <SelectItem value="school_owner">School Owner</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="finance_officer">Finance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* School Selection - shown for admins creating school-level roles */}
          {canAssignSchools && roleRequiresSchool && (
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
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Enter temporary password"
            />
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
