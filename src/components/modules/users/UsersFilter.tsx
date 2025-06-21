
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface UsersFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

const UsersFilter: React.FC<UsersFilterProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter = 'all',
  onStatusFilterChange
}) => {
  const clearFilters = () => {
    onSearchChange('');
    onRoleFilterChange('all');
    if (onStatusFilterChange) onStatusFilterChange('all');
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="elimisha_admin">Elimisha Admin</SelectItem>
                <SelectItem value="edufam_admin">EduFam Admin</SelectItem>
                <SelectItem value="school_owner">School Owner</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="finance_officer">Finance Officer</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {onStatusFilterChange && (
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Search: "{searchTerm}"
            </div>
          )}
          {roleFilter !== 'all' && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Role: {roleFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          )}
          {statusFilter !== 'all' && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersFilter;
