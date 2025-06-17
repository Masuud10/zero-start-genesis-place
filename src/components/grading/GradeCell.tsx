
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GradeCellProps {
  curriculumType: 'cbc' | 'igcse' | 'standard';
  grade: {
    score?: number | null;
    letter_grade?: string | null;
    cbc_performance_level?: string | null;
  };
  onGradeChange: (value: any) => void;
}

const CBC_LEVELS = [
  { value: 'exceeds_expectations', label: 'EE - Exceeds Expectations' },
  { value: 'meets_expectations', label: 'ME - Meets Expectations' },
  { value: 'approaches_expectations', label: 'AE - Approaches Expectations' },
  { value: 'below_expectations', label: 'BE - Below Expectations' }
];

const LETTER_GRADES = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' }
];

const GradeCell: React.FC<GradeCellProps> = ({ curriculumType, grade, onGradeChange }) => {
  const [localScore, setLocalScore] = useState<string>(grade.score?.toString() || '');

  useEffect(() => {
    setLocalScore(grade.score?.toString() || '');
  }, [grade.score]);

  const handleScoreChange = (value: string) => {
    setLocalScore(value);
    
    // Only update if it's a valid number or empty
    if (value === '' || !isNaN(Number(value))) {
      const numericValue = value === '' ? null : Number(value);
      onGradeChange({ ...grade, score: numericValue });
    }
  };

  const handleScoreBlur = () => {
    // Validate on blur
    if (localScore !== '' && (isNaN(Number(localScore)) || Number(localScore) < 0 || Number(localScore) > 100)) {
      setLocalScore(grade.score?.toString() || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow navigation keys
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.currentTarget.blur();
      // Find next input and focus it
      const inputs = Array.from(document.querySelectorAll('input[type="number"], select'));
      const currentIndex = inputs.indexOf(e.currentTarget as HTMLInputElement);
      const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  if (curriculumType === 'cbc') {
    return (
      <Select
        value={grade.cbc_performance_level || ''}
        onValueChange={(value) => onGradeChange({ ...grade, cbc_performance_level: value })}
      >
        <SelectTrigger className="w-full h-8">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          {CBC_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              {level.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (curriculumType === 'igcse') {
    return (
      <div className="space-y-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={localScore}
          onChange={(e) => handleScoreChange(e.target.value)}
          onBlur={handleScoreBlur}
          onKeyDown={handleKeyDown}
          placeholder="Score"
          className="h-8 text-center"
        />
        <Select
          value={grade.letter_grade || ''}
          onValueChange={(value) => onGradeChange({ ...grade, letter_grade: value })}
        >
          <SelectTrigger className="w-full h-6 text-xs">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            {LETTER_GRADES.map((letterGrade) => (
              <SelectItem key={letterGrade.value} value={letterGrade.value}>
                {letterGrade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Standard curriculum - just numeric score
  return (
    <Input
      type="number"
      min="0"
      max="100"
      value={localScore}
      onChange={(e) => handleScoreChange(e.target.value)}
      onBlur={handleScoreBlur}
      onKeyDown={handleKeyDown}
      placeholder="Score"
      className="h-8 text-center"
    />
  );
};

export default GradeCell;
