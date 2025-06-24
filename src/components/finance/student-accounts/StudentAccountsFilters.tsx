
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

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
    new Set(students.map(student => student.class_id))
  ).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Students</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Filter by Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classId) => (
                <SelectItem key={classId} value={classId}>
                  Class {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StudentAccountsFilters;
