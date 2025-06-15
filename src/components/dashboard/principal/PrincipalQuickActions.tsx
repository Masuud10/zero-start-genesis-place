
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Calendar, MessageSquare, Plus } from "lucide-react";

interface PrincipalQuickActionsProps {
  onAddParent: () => void;
  onAddTeacher: () => void;
}

const PrincipalQuickActions: React.FC<PrincipalQuickActionsProps> = ({
  onAddParent,
  onAddTeacher,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="h-20 flex-col gap-2 hover:bg-blue-50"
        onClick={onAddParent}
      >
        <Users className="h-6 w-6" />
        <span>Add Parent</span>
      </Button>
      <Button
        variant="outline"
        className="h-20 flex-col gap-2 hover:bg-green-50"
        onClick={onAddTeacher}
      >
        <GraduationCap className="h-6 w-6" />
        <span>Add Teacher</span>
      </Button>
      <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
        <Calendar className="h-6 w-6" />
        <span>View Timetable</span>
      </Button>
      <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
        <MessageSquare className="h-6 w-6" />
        <span>Announcements</span>
      </Button>
    </div>
  );
};

export default PrincipalQuickActions;
