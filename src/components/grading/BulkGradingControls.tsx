
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, FileText, Users } from 'lucide-react';

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
  { value: 'OPENER', label: 'Opener Exam' },
  { value: 'MID_TERM', label: 'Mid Term Exam' },
  { value: 'END_TERM', label: 'End Term Exam' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'TEST', label: 'Test' },
  { value: 'PROJECT', label: 'Project' }
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
  const selectedClassData = classes.find(c => c.id === selectedClass);
  const selectedTermData = academicTerms.find(t => t.term_name === selectedTerm);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Grade Entry Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class-select" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Class
            </Label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {cls.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClassData && (
              <div className="text-sm text-muted-foreground">
                Class: {selectedClassData.name}
              </div>
            )}
          </div>

          {/* Term Selection */}
          <div className="space-y-2">
            <Label htmlFor="term-select" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Academic Term
            </Label>
            <Select value={selectedTerm} onValueChange={onTermChange}>
              <SelectTrigger id="term-select">
                <SelectValue placeholder="Choose term..." />
              </SelectTrigger>
              <SelectContent>
                {academicTerms.map((term) => (
                  <SelectItem key={term.id} value={term.term_name}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {term.term_name}
                      {term.is_current && <Badge variant="secondary" className="ml-2">Current</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTermData && (
              <div className="text-sm text-muted-foreground">
                {new Date(selectedTermData.start_date).toLocaleDateString()} - {new Date(selectedTermData.end_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Exam Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="exam-select" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exam Type
            </Label>
            <Select value={selectedExamType} onValueChange={onExamTypeChange}>
              <SelectTrigger id="exam-select">
                <SelectValue placeholder="Choose exam type..." />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((exam) => (
                  <SelectItem key={exam.value} value={exam.value}>
                    {exam.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        {selectedClass && selectedTerm && selectedExamType && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <FileText className="h-4 w-4" />
              Grading Session Summary
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Class:</span> {selectedClassData?.name}
              </div>
              <div>
                <span className="font-medium">Term:</span> {selectedTerm}
              </div>
              <div>
                <span className="font-medium">Exam:</span> {EXAM_TYPES.find(e => e.value === selectedExamType)?.label}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkGradingControls;
