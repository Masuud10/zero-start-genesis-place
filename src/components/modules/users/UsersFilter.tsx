
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UsersFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

const UsersFilter: React.FC<UsersFilterProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
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
    </div>
  );
};

export default UsersFilter;
