
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface AnalyticsFiltersProps {
  filters: {
    term: string;
    class: string;
    subject: string;
    dateRange: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    term: string;
    class: string;
    subject: string;
    dateRange: string;
  }>>;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ filters, setFilters }) => (
  <div className="flex flex-wrap gap-3">
    <Select value={filters.term} onValueChange={(value) => setFilters(prev => ({ ...prev, term: value }))}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Term" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current">Current Term</SelectItem>
        <SelectItem value="term1">Term 1</SelectItem>
        <SelectItem value="term2">Term 2</SelectItem>
        <SelectItem value="term3">Term 3</SelectItem>
      </SelectContent>
    </Select>

    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">This Week</SelectItem>
        <SelectItem value="month">This Month</SelectItem>
        <SelectItem value="term">This Term</SelectItem>
        <SelectItem value="year">This Year</SelectItem>
      </SelectContent>
    </Select>

    <Button variant="outline" size="sm">
      Export Report
    </Button>
  </div>
);

export default AnalyticsFilters;
