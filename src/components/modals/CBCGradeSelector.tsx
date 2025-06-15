
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CBC_LEVELS = [
  { value: 'EX', label: 'Exceeding Expectation' },
  { value: 'PR', label: 'Proficient' },
  { value: 'AP', label: 'Approaching Proficiency' },
  { value: 'EM', label: 'Emerging' },
];

interface CBCGradeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CBCGradeSelector: React.FC<CBCGradeSelectorProps> = ({ value, onChange, disabled }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="cbc-level" className="text-right">Performance Level</Label>
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger id="cbc-level" className="col-span-3">
        <SelectValue placeholder="Select CBC Level" />
      </SelectTrigger>
      <SelectContent>
        {CBC_LEVELS.map(level => (
          <SelectItem key={level.value} value={level.value}>{level.label} ({level.value})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default CBCGradeSelector;
