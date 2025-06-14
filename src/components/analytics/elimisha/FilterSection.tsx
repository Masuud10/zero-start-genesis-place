
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, Search } from 'lucide-react';

interface School {
  id: string;
  name: string;
}

interface FilterSectionProps {
  schools: School[];
  selectedSchool: string;
  onSchoolChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  currentTerm: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  schools,
  selectedSchool,
  onSchoolChange,
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  currentTerm
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Analytics Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">School</label>
            <Select value={selectedSchool} onValueChange={onSchoolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select school..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Schools</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by school name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_term">Current Term</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="academic_year">Academic Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Academic Term</label>
            <Badge variant="outline" className="w-fit">
              {currentTerm || 'Current Term'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
