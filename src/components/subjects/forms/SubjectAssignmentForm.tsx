
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubjectAssignmentFormProps {
  classId?: string;
  teacherId?: string;
  classList: Array<{ id: string; name: string }>;
  teacherList: Array<{ id: string; name: string }>;
  onClassChange: (value?: string) => void;
  onTeacherChange: (value?: string) => void;
  loading: boolean;
  loadingEntities: boolean;
}

const SubjectAssignmentForm: React.FC<SubjectAssignmentFormProps> = ({
  classId,
  teacherId,
  classList,
  teacherList,
  onClassChange,
  onTeacherChange,
  loading,
  loadingEntities
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-gray-700">Class (Optional)</Label>
        <Select 
          value={classId || ''} 
          onValueChange={(value) => onClassChange(value || undefined)}
          disabled={loading || loadingEntities}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500">
            <SelectValue placeholder="Select specific class or leave for all" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="">All Classes</SelectItem>
            {classList.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Teacher (Optional)</Label>
        <Select 
          value={teacherId || ''} 
          onValueChange={(value) => onTeacherChange(value || undefined)}
          disabled={loading || loadingEntities}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500">
            <SelectValue placeholder="Assign teacher later" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="">No teacher assigned</SelectItem>
            {teacherList.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SubjectAssignmentForm;
