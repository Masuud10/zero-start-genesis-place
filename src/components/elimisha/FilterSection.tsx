
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const clearSearch = () => {
    onSearchChange('');
  };

  const clearFilters = () => {
    onSchoolChange('all');
    onSearchChange('');
    onDateRangeChange('current_term');
  };

  const hasActiveFilters = selectedSchool !== 'all' || searchTerm.trim() !== '' || dateRange !== 'current_term';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
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
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedSchool !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  School: {schools.find(s => s.id === selectedSchool)?.name || selectedSchool}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSchoolChange('all')}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {searchTerm.trim() && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {dateRange !== 'current_term' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Period: {dateRange.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateRangeChange('current_term')}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSection;
