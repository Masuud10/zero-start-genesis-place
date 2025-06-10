
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

const UsersFilter = ({ searchTerm, onSearchChange, roleFilter, onRoleFilterChange }: UsersFilterProps) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
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
  );
};

export default UsersFilter;
