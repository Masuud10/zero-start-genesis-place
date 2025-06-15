
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Megaphone, BookOpen, ClipboardCheck, CalendarCheck, MessageSquare } from 'lucide-react';
import { AuthUser } from '@/types/auth';

interface TeacherActionsProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const teacherActionsList = [
  {
    id: "create-announcement",
    label: "New Announcement",
    description: "Post important updates",
    icon: Megaphone,
  },
  {
    id: "view-classes",
    label: "View Classes",
    description: "Manage your classes",
    icon: BookOpen,
  },
  {
    id: "manage-grades",
    label: "Manage Grades",
    description: "Enter student grades",
    icon: ClipboardCheck,
  },
  {
    id: "view-attendance",
    label: "Mark Attendance",
    description: "Mark and view attendance",
    icon: CalendarCheck,
  },
  {
    id: "send-message",
    label: "Send Message",
    description: "Communicate with students",
    icon: MessageSquare,
  },
];

const TeacherActions: React.FC<TeacherActionsProps> = ({ user, onModalOpen }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teaching Tools
            </CardTitle>
            <CardDescription>
                Access your classroom management features
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {teacherActionsList.map((action) => (
                    <Button
                        key={action.id}
                        variant="outline"
                        className="h-24 flex-col gap-2 p-4"
                        onClick={() => onModalOpen(action.id)}
                    >
                        <action.icon className="h-6 w-6" />
                        <div className="text-center">
                            <div className="font-medium text-sm">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                    </Button>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default TeacherActions;
