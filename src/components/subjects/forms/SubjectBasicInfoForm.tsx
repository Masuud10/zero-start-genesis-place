
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubjectBasicInfoFormProps {
  name: string;
  code: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  loading: boolean;
}

const SubjectBasicInfoForm: React.FC<SubjectBasicInfoFormProps> = ({
  name,
  code,
  onNameChange,
  onCodeChange,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700">
          Subject Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Mathematics"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          disabled={loading}
          className="border-gray-300 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-gray-700">
          Subject Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="code"
          placeholder="e.g., MATH101"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          required
          disabled={loading}
          maxLength={10}
          className="border-gray-300 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default SubjectBasicInfoForm;
