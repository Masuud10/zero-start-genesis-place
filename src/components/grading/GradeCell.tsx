
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CBCGradeSelector from '../modals/CBCGradeSelector';

interface GradeCellProps {
  curriculumType: 'cbc' | 'igcse' | 'standard';
  grade: any;
  onGradeChange: (value: any) => void;
  disabled?: boolean;
}

const IGCSE_LETTER_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'];

const GradeCell: React.FC<GradeCellProps> = ({ curriculumType, grade, onGradeChange, disabled }) => {
  switch (curriculumType) {
    case 'cbc':
      return (
        <CBCGradeSelector
          value={grade?.cbc_performance_level || ''}
          onChange={(value) => onGradeChange({ cbc_performance_level: value })}
          disabled={disabled}
        />
      );
    case 'igcse':
      return (
        <Select
          onValueChange={(value) => onGradeChange({ letter_grade: value })}
          value={grade?.letter_grade || ''}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            {IGCSE_LETTER_GRADES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          type="number"
          value={grade?.score || ''}
          onChange={(e) => onGradeChange({ score: e.target.valueAsNumber })}
          className="w-24"
          disabled={disabled}
        />
      );
  }
};

export default GradeCell;
