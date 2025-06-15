
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IGCSESubjectPickerProps {
  useCustomSubject: boolean;
  setUseCustomSubject: (val: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
  freeformSubject: string;
  setFreeformSubject: (val: string) => void;
  subjects: any[];
  selectedClass: string;
}

const IGCSESubjectPicker: React.FC<IGCSESubjectPickerProps> = ({
  useCustomSubject,
  setUseCustomSubject,
  selectedSubject,
  setSelectedSubject,
  freeformSubject,
  setFreeformSubject,
  subjects,
  selectedClass
}) => {
  return (
    !useCustomSubject ? (
      <div className="flex col-span-3 gap-2">
        <Select onValueChange={e => {
          setSelectedSubject(e);
          if (e === 'custom') setUseCustomSubject(true);
        }} disabled={!selectedClass}>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subj => (
              <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
            ))}
            <SelectItem value="custom">
              Other (free form)
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setUseCustomSubject(true)}
        >
          Custom
        </Button>
      </div>
    ) : (
      <div className="flex col-span-3 gap-2">
        <Input
          placeholder="Enter subject name"
          value={freeformSubject}
          onChange={e => setFreeformSubject(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setUseCustomSubject(false);
            setFreeformSubject('');
          }}
        >Cancel</Button>
      </div>
    )
  );
};

export default IGCSESubjectPicker;
