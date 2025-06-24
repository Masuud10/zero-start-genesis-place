
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface StudentAccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  students: any[];
}

const StudentAccountsFilters: React.FC<StudentAccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  students
}) => {
  // Get unique classes from students
  const classes = Array.from(
    new Set(
      students
        .filter(student => student?.classes?.name)
        .map(student => ({
          id: student.class_id || 'unknown',
          name: student.classes?.name || 'Unknown Class'
        }))
    )
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by student name or admission number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="w-full sm:w-[200px]">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger>
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentAccountsFilters;
