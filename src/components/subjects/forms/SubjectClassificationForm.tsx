
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubjectClassificationFormProps {
  category: string;
  creditHours: number;
  curriculum: string;
  onCategoryChange: (value: string) => void;
  onCreditHoursChange: (value: number) => void;
  onCurriculumChange: (value: string) => void;
  loading: boolean;
}

const SubjectClassificationForm: React.FC<SubjectClassificationFormProps> = ({
  category,
  creditHours,
  curriculum,
  onCategoryChange,
  onCreditHoursChange,
  onCurriculumChange,
  loading
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-700">Category</Label>
          <Select 
            value={category} 
            onValueChange={onCategoryChange}
            disabled={loading}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="core">Core Subject</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="arts">Arts & Humanities</SelectItem>
              <SelectItem value="languages">Languages</SelectItem>
              <SelectItem value="technical">Technical/Vocational</SelectItem>
              <SelectItem value="sports">Physical Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Credit Hours</Label>
          <Select 
            value={creditHours.toString()} 
            onValueChange={(value) => onCreditHoursChange(parseInt(value) || 1)}
            disabled={loading}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {[1, 2, 3, 4, 5, 6].map((hours) => (
                <SelectItem key={hours} value={hours.toString()}>
                  {hours} {hours === 1 ? 'Hour' : 'Hours'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Curriculum System</Label>
        <Select 
          value={curriculum} 
          onValueChange={onCurriculumChange}
          disabled={loading}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
            <SelectItem value="8-4-4">8-4-4 System</SelectItem>
            <SelectItem value="igcse">IGCSE</SelectItem>
            <SelectItem value="ib">International Baccalaureate</SelectItem>
            <SelectItem value="other">Other System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default SubjectClassificationForm;
