
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, FileCheck } from 'lucide-react';

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
  const examTypes = [
    { value: 'OPENER', label: 'Opener Exam' },
    { value: 'MID_TERM', label: 'Mid Term Exam' },
    { value: 'END_TERM', label: 'End Term Exam' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'TEST', label: 'Test' },
    { value: 'PROJECT', label: 'Project' },
  ];

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Grading Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Select Class
            </label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No classes available</div>
                ) : (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.stream && `- ${cls.stream}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Term Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Academic Term
            </label>
            <Select value={selectedTerm} onValueChange={onTermChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a term..." />
              </SelectTrigger>
              <SelectContent>
                {academicTerms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No terms available</div>
                ) : (
                  academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.term_name}>
                      {term.term_name} {term.is_current && '(Current)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Exam Type
            </label>
            <Select value={selectedExamType} onValueChange={onExamTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose exam type..." />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((exam) => (
                  <SelectItem key={exam.value} value={exam.value}>
                    {exam.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedClass && selectedTerm && selectedExamType && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Selected:</span>{' '}
              {classes.find(c => c.id === selectedClass)?.name || 'Unknown Class'} • {selectedTerm} • {examTypes.find(e => e.value === selectedExamType)?.label || selectedExamType}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkGradingControls;
