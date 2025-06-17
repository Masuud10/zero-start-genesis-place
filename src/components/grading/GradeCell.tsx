
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GradeCellProps {
  curriculumType: 'cbc' | 'igcse' | 'standard';
  grade: {
    score?: number | null;
    letter_grade?: string | null;
    cbc_performance_level?: string | null;
    percentage?: number | null;
  };
  onGradeChange: (grade: any) => void;
}

const GradeCell: React.FC<GradeCellProps> = ({
  curriculumType,
  grade,
  onGradeChange,
}) => {
  const [scoreInput, setScoreInput] = useState(grade.score?.toString() || '');

  useEffect(() => {
    setScoreInput(grade.score?.toString() || '');
  }, [grade.score]);

  const handleScoreChange = (value: string) => {
    setScoreInput(value);
    
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      const percentage = Math.round(numericValue);
      let letterGrade = '';
      let cbcLevel = '';

      // Calculate letter grade for standard curriculum
      if (curriculumType === 'standard') {
        if (numericValue >= 90) letterGrade = 'A+';
        else if (numericValue >= 80) letterGrade = 'A';
        else if (numericValue >= 70) letterGrade = 'B+';
        else if (numericValue >= 60) letterGrade = 'B';
        else if (numericValue >= 50) letterGrade = 'C+';
        else if (numericValue >= 40) letterGrade = 'C';
        else if (numericValue >= 30) letterGrade = 'D+';
        else if (numericValue >= 20) letterGrade = 'D';
        else letterGrade = 'E';
      }

      // Calculate CBC performance level
      if (curriculumType === 'cbc') {
        if (numericValue >= 90) cbcLevel = 'Exceeds Expectations';
        else if (numericValue >= 70) cbcLevel = 'Meets Expectations';
        else if (numericValue >= 50) cbcLevel = 'Approaches Expectations';
        else cbcLevel = 'Below Expectations';
      }

      onGradeChange({
        score: numericValue,
        percentage,
        letter_grade: letterGrade || null,
        cbc_performance_level: cbcLevel || null,
      });
    } else if (value === '') {
      onGradeChange({
        score: null,
        percentage: null,
        letter_grade: null,
        cbc_performance_level: null,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow navigation with Tab and Enter
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      const nextCell = e.currentTarget.closest('td')?.nextElementSibling?.querySelector('input');
      if (nextCell) {
        (nextCell as HTMLElement).focus();
      } else {
        // Move to next row
        const currentRow = e.currentTarget.closest('tr');
        const nextRow = currentRow?.nextElementSibling;
        const firstCellInNextRow = nextRow?.querySelector('td:nth-child(2) input');
        if (firstCellInNextRow) {
          (firstCellInNextRow as HTMLElement).focus();
        }
      }
    }
  };

  if (curriculumType === 'cbc') {
    return (
      <div className="space-y-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={scoreInput}
          onChange={(e) => handleScoreChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="0-100"
          className="h-8 text-center"
        />
        {grade.cbc_performance_level && (
          <div className="text-xs text-center text-muted-foreground">
            {grade.cbc_performance_level}
          </div>
        )}
      </div>
    );
  }

  if (curriculumType === 'igcse') {
    return (
      <div className="space-y-1">
        <Input
          type="number"
          min="0"
          max="100"
          value={scoreInput}
          onChange={(e) => handleScoreChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="0-100"
          className="h-8 text-center"
        />
        <Select
          value={grade.letter_grade || ''}
          onValueChange={(value) => onGradeChange({ ...grade, letter_grade: value })}
        >
          <SelectTrigger className="h-6 text-xs">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A*">A*</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="E">E</SelectItem>
            <SelectItem value="F">F</SelectItem>
            <SelectItem value="G">G</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Standard curriculum
  return (
    <div className="space-y-1">
      <Input
        type="number"
        min="0"
        max="100"
        value={scoreInput}
        onChange={(e) => handleScoreChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="0-100"
        className="h-8 text-center"
      />
      {grade.letter_grade && (
        <div className="text-xs text-center font-medium text-blue-600">
          {grade.letter_grade}
        </div>
      )}
    </div>
  );
};

export default GradeCell;
