
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/hooks/fee-management/types';

interface StudentAccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  students: Student[];
}

const StudentAccountsFilters: React.FC<StudentAccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  students
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by student name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {Array.from(new Set(students.map(s => s.class_id))).map(classId => {
            const student = students.find(s => s.class_id === classId);
            return (
              <SelectItem key={classId} value={classId}>
                {student?.class?.name || 'Unknown'}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StudentAccountsFilters;
