
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClassFilterBarProps {
  availableClasses: { id: string; name: string }[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
}

const ClassFilterBar: React.FC<ClassFilterBarProps> = ({
  availableClasses,
  selectedClassId,
  onSelectClass
}) => {
  if (!availableClasses.length) return null;
  return (
    <div className="flex items-center gap-4 mb-2">
      <span className="text-sm font-medium">Select Class:</span>
      <div className="min-w-[200px]">
        <Select
          value={selectedClassId || ""}
          onValueChange={onSelectClass}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a class" />
          </SelectTrigger>
          <SelectContent>
            {availableClasses.map((cls) => (
              <SelectItem value={cls.id} key={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export default ClassFilterBar;
