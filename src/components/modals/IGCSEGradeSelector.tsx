
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IGCSEGradeSelectorProps {
  gradeChoice: string;
  setGradeChoice: (val: string) => void;
  customGrade: string;
  setCustomGrade: (val: string) => void;
  IGCSE_LETTER_GRADES: string[];
}

const IGCSEGradeSelector: React.FC<IGCSEGradeSelectorProps> = ({
  gradeChoice,
  setGradeChoice,
  customGrade,
  setCustomGrade,
  IGCSE_LETTER_GRADES
}) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-2">
        <Label htmlFor="grade" className="text-right">Grade</Label>
        <Select onValueChange={val => {
          setGradeChoice(val !== 'custom' ? val : '');
          if (val === 'custom') setCustomGrade('');
        }}>
          <SelectTrigger id="grade" className="col-span-3">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            {IGCSE_LETTER_GRADES.map(g => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
            <SelectItem value="custom">Custom...</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {gradeChoice === '' && (
        <div className="grid grid-cols-4 items-center gap-2">
          <Label htmlFor="custom-grade" className="text-right">Custom Grade</Label>
          <Input
            id="custom-grade"
            className="col-span-3"
            placeholder="e.g. P (Pass), or a number"
            value={customGrade}
            onChange={e => setCustomGrade(e.target.value)}
            maxLength={10}
          />
        </div>
      )}
    </>
  );
};

export default IGCSEGradeSelector;
