
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BulkGradingControlsProps {
  classes: any[];
  academicTerms: any[];
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedTerm: string;
  onTermChange: (value: string) => void;
  selectedExamType: string;
  onExamTypeChange: (value: string) => void;
}

const EXAM_TYPES = [
  { value: 'opener', label: 'Opener' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'end_term', label: 'End Term' },
  { value: 'project', label: 'Project' },
];

const BulkGradingControls: React.FC<BulkGradingControlsProps> = ({
  classes,
  academicTerms,
  selectedClass,
  onClassChange,
  selectedTerm,
  onTermChange,
  selectedExamType,
  onExamTypeChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md mb-4">
      <div>
        <Label>Class</Label>
        <Select onValueChange={onClassChange} value={selectedClass}>
          <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Term</Label>
        <Select onValueChange={onTermChange} value={selectedTerm}>
          <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
          <SelectContent>
            {academicTerms.map((term) => (<SelectItem key={term.id} value={term.term_name}>{term.term_name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Assessment / Exam Type</Label>
        <Select onValueChange={onExamTypeChange} value={selectedExamType}>
          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
          <SelectContent>
            {EXAM_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BulkGradingControls;
