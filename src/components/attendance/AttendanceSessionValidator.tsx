
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface AttendanceSessionValidatorProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const AttendanceSessionValidator: React.FC<AttendanceSessionValidatorProps> = ({
  value,
  onValueChange,
  error,
  required = true
}) => {
  const sessionOptions = [
    { value: 'morning', label: 'Morning Session' },
    { value: 'afternoon', label: 'Afternoon Session' },
    { value: 'full_day', label: 'Full Day' }
  ];

  const handleValueChange = (newValue: string) => {
    // Validate the session value
    if (!['morning', 'afternoon', 'full_day'].includes(newValue)) {
      console.error('Invalid session value:', newValue);
      return;
    }
    onValueChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="session" className="flex items-center gap-2">
        Session {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange} required={required}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select session" />
        </SelectTrigger>
        <SelectContent>
          {sessionOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default AttendanceSessionValidator;
