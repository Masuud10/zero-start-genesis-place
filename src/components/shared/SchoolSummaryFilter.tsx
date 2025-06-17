
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface SchoolSummaryFilterProps {
  schools: Array<{ id: string; name: string }>;
  value: string | null;
  onChange: (schoolId: string | null) => void;
  loading?: boolean;
}

const SchoolSummaryFilter: React.FC<SchoolSummaryFilterProps> = ({
  schools,
  value,
  onChange,
  loading = false,
}) => (
  <div className="flex flex-col w-full max-w-xs my-2">
    <label className="text-sm font-medium mb-1 text-gray-700" htmlFor="school-summary-filter">
      Filter by School
    </label>
    <Select
      value={value || ""}
      onValueChange={val => onChange(val || null)}
      disabled={loading}
    >
      <SelectTrigger id="school-summary-filter" className="bg-white">
        <SelectValue placeholder={loading ? "Loading schools..." : "All Schools"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Schools</SelectItem>
        {schools.map(s => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default SchoolSummaryFilter;
