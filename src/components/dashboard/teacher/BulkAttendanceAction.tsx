
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';
import { AuthUser } from '@/types/auth';

interface BulkAttendanceActionProps {
  user: AuthUser;
}

const BulkAttendanceAction: React.FC<BulkAttendanceActionProps> = ({ user }) => {
  const handleBulkAttendance = () => {
    console.log('Opening bulk attendance for teacher:', user.id);
    // TODO: Implement bulk attendance functionality
  };

  return (
    <Button
      variant="outline"
      className="h-24 flex-col gap-2 p-4"
      onClick={handleBulkAttendance}
    >
      <CalendarCheck className="h-6 w-6" />
      <div className="text-center">
        <div className="font-medium text-sm">Bulk Attendance</div>
        <div className="text-xs text-muted-foreground">Mark attendance for all</div>
      </div>
    </Button>
  );
};

export default BulkAttendanceAction;
