
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface SchoolSummaryFilterProps {
  schools: Array<{ id: string; name: string }>;
  value: string | null;
  onChange: (schoolId: string | null) => void;
}

const SchoolSummaryFilter: React.FC<SchoolSummaryFilterProps> = ({
  schools,
  value,
  onChange,
}) => (
  <div className="flex flex-col w-full max-w-xs my-2">
    <label className="text-sm font-medium mb-1" htmlFor="school-summary-filter">Filter by School</label>
    <Select
      value={value || ""}
      onValueChange={val => onChange(val || null)}
    >
      <SelectTrigger id="school-summary-filter">
        <SelectValue placeholder="All Schools" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Schools</SelectItem>
        {schools.map(s => (
          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default SchoolSummaryFilter;
