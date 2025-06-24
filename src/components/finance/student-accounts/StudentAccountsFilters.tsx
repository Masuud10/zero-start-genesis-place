
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  class_name: string;
}

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
  // Get unique classes from students
  const uniqueClasses = Array.from(
    new Set(students.map(student => student.class_id))
  ).map(classId => {
    const student = students.find(s => s.class_id === classId);
    return {
      id: classId,
      name: student?.class_name || 'Unknown'
    };
  }).filter(cls => cls.id);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <Label htmlFor="search">Search Students</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="search"
            placeholder="Search by name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="sm:w-48">
        <Label htmlFor="class-filter">Filter by Class</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger>
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map((cls) => (
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
