import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Save, X } from 'lucide-react';

interface EditUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    school_id?: string;
    phone?: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

interface School {
  id: string;
  name: string;
}

const EditUserDialog = ({ user, open, onClose, onUserUpdated }: EditUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    role: '',
    school_id: '',
    phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        school_id: user.school_id || '',
        phone: user.phone || ''
      });
      fetchSchools();
    }
  }, [user, open]);

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

  const validateForm = () => {
    if (!editedUser.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the user's full name",
        variant: "destructive",
      });
      return false;
    }

    if (!editedUser.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!editedUser.role) {
      toast({
        title: "Validation Error",
        description: "Please select a role for the user",
        variant: "destructive",
      });
      return false;
    }

    // School assignment validation
    if (!['elimisha_admin', 'edufam_admin'].includes(editedUser.role) && !editedUser.school_id) {
      toast({
        title: "Validation Error",
        description: "Please select a school for this role",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleUpdateUser = async () => {
    if (!user || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: editedUser.name,
          email: editedUser.email,
          role: editedUser.role,
          school_id: ['elimisha_admin', 'edufam_admin'].includes(editedUser.role) ? null : editedUser.school_id,
          phone: editedUser.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      toast({
        title: "User Updated Successfully",
        description: `${editedUser.name} has been updated successfully.`,
      });

      onClose();
      onUserUpdated();

    } catch (error: any) {
      console.error('Error updating user:', error);
      
      toast({
        title: "Error Updating User",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableRoles = () => [
    { value: 'elimisha_admin', label: 'Elimisha Admin' },
    { value: 'edufam_admin', label: 'EduFam Admin' },
    { value: 'school_owner', label: 'School Director' },
    { value: 'principal', label: 'Principal' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'parent', label: 'Parent' },
    { value: 'finance_officer', label: 'Finance Officer' }
  ];

  const shouldShowSchoolSelector = () => {
    return !['elimisha_admin', 'edufam_admin'].includes(editedUser.role);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information and role assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-email">Email Address *</Label>
            <Input
              id="edit-email"
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={editedUser.phone}
              onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-role">User Role *</Label>
            <Select value={editedUser.role} onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {shouldShowSchoolSelector() && (
            <div>
              <Label htmlFor="edit-school">Assign to School *</Label>
              <Select value={editedUser.school_id} onValueChange={(value) => setEditedUser({ ...editedUser, school_id: value })}>
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
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
