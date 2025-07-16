import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SupportStaff, SUPPORT_STAFF_ROLES, EMPLOYMENT_TYPES } from '@/types/supportStaff';
import { SupportStaffService } from '@/services/supportStaffService';
import { Loader2 } from 'lucide-react';

interface EditStaffDialogProps {
  staff: SupportStaff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffUpdated: () => void;
}

export const EditStaffDialog: React.FC<EditStaffDialogProps> = ({
  staff,
  open,
  onOpenChange,
  onStaffUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role_title: '',
    department: '',
    employment_type: '',
    phone: '',
    email: '',
    address: '',
    salary_amount: '',
    salary_currency: 'KES',
    notes: '',
    is_active: true
  });

  useEffect(() => {
    if (staff && open) {
      setFormData({
        full_name: staff.full_name || '',
        role_title: staff.role_title || '',
        department: staff.department || '',
        employment_type: staff.employment_type || '',
        phone: staff.phone || '',
        email: staff.email || '',
        address: staff.address || '',
        salary_amount: staff.salary_amount?.toString() || '',
        salary_currency: staff.salary_currency || 'KES',
        notes: staff.notes || '',
        is_active: staff.is_active ?? true
      });
    }
  }, [staff, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        role_title: formData.role_title as any,
        employment_type: formData.employment_type as any,
        salary_amount: formData.salary_amount ? parseFloat(formData.salary_amount) : undefined
      };

      await SupportStaffService.updateSupportStaff(staff.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Staff member updated successfully'
      });

      onStaffUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update staff member',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_title">Role *</Label>
              <Select value={formData.role_title} onValueChange={(value) => handleInputChange('role_title', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_STAFF_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type *</Label>
              <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_amount">Salary Amount</Label>
              <Input
                id="salary_amount"
                type="number"
                value={formData.salary_amount}
                onChange={(e) => handleInputChange('salary_amount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_currency">Currency</Label>
              <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Staff'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};