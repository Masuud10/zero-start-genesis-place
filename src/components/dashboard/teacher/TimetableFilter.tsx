import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface TimetableFilterProps {
  onFilterChange: (filters: {
    day?: string;
    subject?: string;
    class?: string;
  }) => void;
  subjects?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string }>;
  isActive: boolean;
}

const TimetableFilter: React.FC<TimetableFilterProps> = ({
  onFilterChange,
  subjects = [],
  classes = [],
  isActive
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleFilterChange = (field: string, value: string) => {
    const newFilters: any = {};
    
    if (field === 'day') {
      setSelectedDay(value);
      newFilters.day = value;
      newFilters.subject = selectedSubject;
      newFilters.class = selectedClass;
    } else if (field === 'subject') {
      setSelectedSubject(value);
      newFilters.day = selectedDay;
      newFilters.subject = value;
      newFilters.class = selectedClass;
    } else if (field === 'class') {
      setSelectedClass(value);
      newFilters.day = selectedDay;
      newFilters.subject = selectedSubject;
      newFilters.class = value;
    }

    // Remove empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]) {
        delete newFilters[key];
      }
    });

    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSelectedDay('');
    setSelectedSubject('');
    setSelectedClass('');
    onFilterChange({});
  };

  const hasActiveFilters = selectedDay || selectedSubject || selectedClass;

  if (!isActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter Timetable:</span>
      </div>

      {/* Day Filter */}
      <Select value={selectedDay} onValueChange={(value) => handleFilterChange('day', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Days</SelectItem>
          {days.map((day) => (
            <SelectItem key={day.value} value={day.value}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subject Filter */}
      <Select value={selectedSubject} onValueChange={(value) => handleFilterChange('subject', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Subjects</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Class Filter */}
      <Select value={selectedClass} onValueChange={(value) => handleFilterChange('class', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Classes</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="ml-2"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default TimetableFilter;