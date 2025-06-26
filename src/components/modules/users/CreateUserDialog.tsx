
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface CreateUserDialogProps {
  children: React.ReactNode;
  onUserCreated: () => void;
}

interface CreateUserRpcResponse {
  success?: boolean;
  error?: string;
  user_id?: string;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ children, onUserCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'TempPassword123!',
    role: '',
    phone: '',
    schoolId: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

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
    enabled: open && user?.role === 'edufam_admin'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure non-admin users are assigned to a school
      let finalSchoolId = formData.schoolId;
      
      if (formData.role !== 'edufam_admin') {
        if (!finalSchoolId) {
          // If no school selected and user is edufam_admin, require school selection
          if (user?.role === 'edufam_admin') {
            throw new Error('Please select a school for this user role');
          }
          // If current user has a school, use that
          finalSchoolId = user?.school_id || '';
        }
        
        if (!finalSchoolId) {
          throw new Error('School assignment is required for this role');
        }
      }

      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: formData.email,
        user_password: formData.password,
        user_name: formData.name,
        user_role: formData.role,
        user_school_id: finalSchoolId || null
      });
      
      if (error) throw error;

      const result = data as CreateUserRpcResponse;
      
      if (result && result.success) {
        toast({
          title: "Success",
          description: "User created successfully with proper school assignment",
        });

        setOpen(false);
        setFormData({ name: '', email: '', password: 'TempPassword123!', role: '', phone: '', schoolId: '' });
        onUserCreated();
      } else {
        throw new Error(result?.error || 'Failed to create user');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'principal', label: 'Principal' },
    { value: 'school_owner', label: 'School Owner' },
    { value: 'finance_officer', label: 'Finance Officer' },
    ...(user?.role === 'edufam_admin' ? [
      { value: 'edufam_admin', label: 'EduFam Admin' }
    ] : [])
  ];

  // Check if school selection should be shown
  const shouldShowSchoolSelection = user?.role === 'edufam_admin' && formData.role !== 'edufam_admin';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Temporary Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
            <p className="text-xs text-gray-500 mt-1">
              User will be prompted to change this password on first login.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
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

          {/* School selection - only for system admins creating non-admin users */}
          {shouldShowSchoolSelection && (
            <div>
              <Label htmlFor="school">Assign to School *</Label>
              <Select 
                value={formData.schoolId} 
                onValueChange={(value) => setFormData({...formData, schoolId: value})}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
