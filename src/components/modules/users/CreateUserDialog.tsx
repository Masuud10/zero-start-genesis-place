
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const { toast } = useToast();

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role
          }
        }
      });

      if (authError) throw authError;

      // If successful, the user profile will be created automatically via the trigger
      toast({
        title: "Success",
        description: "User created successfully. They will receive a confirmation email.",
      });

      setIsCreateDialogOpen(false);
      setNewUser({ name: '', email: '', role: '', password: '' });
      
      // Refresh users list after a short delay to allow for the trigger to complete
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

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
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
                <SelectItem value="elimisha_admin">Elimisha Admin</SelectItem>
                <SelectItem value="edufam_admin">EduFam Admin</SelectItem>
                <SelectItem value="school_owner">School Owner</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="finance_officer">Finance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
