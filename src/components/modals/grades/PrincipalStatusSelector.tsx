

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PrincipalStatusSelectorProps {
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  setStatus: (status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released') => void;
  canRelease: boolean;
}

const PrincipalStatusSelector: React.FC<PrincipalStatusSelectorProps> = ({
  status,
  setStatus,
  canRelease
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4 py-4">
      <Label htmlFor="status" className="text-right">
        Status
      </Label>
      <Select
        onValueChange={(value) => setStatus(value as 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released')}
        value={status}
      >
        <SelectTrigger id="status" className="col-span-3">
          <SelectValue placeholder="Set Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          {canRelease && <SelectItem value="released">Released</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PrincipalStatusSelector;

