
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
  { value: 'opener', label: 'Opener Exam' },
  { value: 'mid_term', label: 'Mid Term Exam' },
  { value: 'end_term', label: 'End Term Exam' },
  { value: 'project', label: 'Project Assessment' },
  { value: 'cat', label: 'CAT (Continuous Assessment)' },
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 border rounded-lg mb-4">
      <div className="space-y-2">
        <Label htmlFor="class-select" className="text-sm font-medium">Class</Label>
        <Select onValueChange={onClassChange} value={selectedClass}>
          <SelectTrigger id="class-select">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.length === 0 ? (
              <SelectItem value="no-classes" disabled>No classes found</SelectItem>
            ) : (
              classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="term-select" className="text-sm font-medium">Academic Term</Label>
        <Select onValueChange={onTermChange} value={selectedTerm}>
          <SelectTrigger id="term-select">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            {academicTerms.length === 0 ? (
              <SelectItem value="no-terms" disabled>No terms found</SelectItem>
            ) : (
              academicTerms.map((term) => (
                <SelectItem key={term.id || term.term_name} value={term.term_name}>
                  {term.term_name} {term.is_current && "(Current)"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="exam-select" className="text-sm font-medium">Assessment Type</Label>
        <Select onValueChange={onExamTypeChange} value={selectedExamType}>
          <SelectTrigger id="exam-select">
            <SelectValue placeholder="Select Assessment" />
          </SelectTrigger>
          <SelectContent>
            {EXAM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BulkGradingControls;
