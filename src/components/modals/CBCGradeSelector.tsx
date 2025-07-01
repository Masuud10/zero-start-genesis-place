
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CBCGradeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CBC_PERFORMANCE_LEVELS = [
  { 
    value: 'EX', 
    label: 'Exemplary', 
    description: 'Consistently demonstrates exceptional understanding and application of competencies',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'PR', 
    label: 'Proficient', 
    description: 'Demonstrates good understanding and application of competencies',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'AP', 
    label: 'Approaching Proficiency', 
    description: 'Shows developing understanding with support needed',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    value: 'EM', 
    label: 'Emerging', 
    description: 'Beginning to show understanding, needs significant support',
    color: 'bg-red-100 text-red-800'
  }
];

const CBCGradeSelector: React.FC<CBCGradeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const selectedLevel = CBC_PERFORMANCE_LEVELS.find(level => level.value === value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select CBC performance level" />
        </SelectTrigger>
        <SelectContent>
          {CBC_PERFORMANCE_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              <div className="flex items-center gap-2">
                <Badge className={`${level.color} text-xs`}>
                  {level.value}
                </Badge>
                <span>{level.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedLevel && (
        <div className="text-sm text-gray-600 mt-1">
          {selectedLevel.description}
        </div>
      )}
    </div>
  );
};

export default CBCGradeSelector;
