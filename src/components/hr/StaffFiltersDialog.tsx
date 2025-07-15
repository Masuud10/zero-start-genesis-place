import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupportStaffFilters, SUPPORT_STAFF_ROLES, EMPLOYMENT_TYPES, COMMON_DEPARTMENTS } from '@/types/supportStaff';

interface StaffFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SupportStaffFilters;
  onFiltersChange: (filters: SupportStaffFilters) => void;
}

export const StaffFiltersDialog: React.FC<StaffFiltersDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange
}) => {
  const updateFilter = (key: keyof SupportStaffFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const applyFilters = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Staff</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role Filter */}
          <div>
            <Label htmlFor="role_filter">Role</Label>
            <Select
              value={filters.role_title || ''}
              onValueChange={(value) => updateFilter('role_title', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                {SUPPORT_STAFF_ROLES.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <Label htmlFor="employment_filter">Employment Type</Label>
            <Select
              value={filters.employment_type || ''}
              onValueChange={(value) => updateFilter('employment_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {EMPLOYMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div>
            <Label htmlFor="department_filter">Department</Label>
            <Select
              value={filters.department || ''}
              onValueChange={(value) => updateFilter('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                {COMMON_DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status_filter">Status</Label>
            <Select
              value={filters.is_active !== undefined ? filters.is_active.toString() : ''}
              onValueChange={(value) => updateFilter('is_active', value === '' ? undefined : value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};