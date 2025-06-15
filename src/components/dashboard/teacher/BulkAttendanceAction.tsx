
import React from "react";
import { Button } from "@/components/ui/button";
import BulkAttendanceModal from "@/components/modals/BulkAttendanceModal";
import { AuthUser } from "@/types/auth";

interface BulkAttendanceActionProps {
  user: AuthUser;
}

const BulkAttendanceAction: React.FC<BulkAttendanceActionProps> = ({ user }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        key="bulk-attendance"
        variant="outline"
        className="h-24 flex-col gap-2 p-4"
        onClick={() => setOpen(true)}
      >
        <div className="h-6 w-6 flex items-center justify-center">
          <span role="img" aria-label="attendance">📝</span>
        </div>
        <div className="text-center">
          <div className="font-medium text-sm">Mark Attendance</div>
          <div className="text-xs text-muted-foreground">Bulk mark students (morning/afternoon)</div>
        </div>
      </Button>
      <BulkAttendanceModal
        open={open}
        onClose={() => setOpen(false)}
        teacherId={user.id}
        schoolId={user.school_id}
      />
    </>
  );
};

export default BulkAttendanceAction;
