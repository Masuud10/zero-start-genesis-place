
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  Upload,
  ClipboardList,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { AuthUser } from '@/types/auth';

interface TeacherToolsSectionProps {
  user: AuthUser;
  onActionClick: (action: string) => void;
  stats?: {
    classCount: number;
    pendingGrades: number;
    todayAttendance: number;
  };
}

const teachingTools = [
  {
    id: 'class-lists',
    label: 'Class Lists',
    description: 'View assigned classes',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    urgency: false
  },
  {
    id: 'attendance-tracking',
    label: 'Attendance Tracking',
    description: 'Mark daily attendance',
    icon: CalendarCheck,
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    urgency: false
  },
  {
    id: 'grade-sheets',
    label: 'Grade Sheets',
    description: 'Input & submit grades',
    icon: GraduationCap,
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    urgency: true
  },
  {
    id: 'learning-resources',
    label: 'Learning Resources',
    description: 'Upload notes & materials',
    icon: Upload,
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    urgency: false
  },
  {
    id: 'assignment-manager',
    label: 'Assignment Manager',
    description: 'Create & track assignments',
    icon: ClipboardList,
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    urgency: false
  },
  {
    id: 'class-analytics',
    label: 'Class Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    urgency: false
  }
];

const TeacherToolsSection: React.FC<TeacherToolsSectionProps> = ({ 
  user, 
  onActionClick, 
  stats 
}) => {
  const getUrgencyBadge = (toolId: string) => {
    switch (toolId) {
      case 'grade-sheets':
        if (stats?.pendingGrades && stats.pendingGrades > 0) {
          return <Badge variant="destructive" className="ml-2">{stats.pendingGrades}</Badge>;
        }
        break;
      case 'attendance-tracking':
        if (stats?.todayAttendance === 0) {
          return <Badge variant="secondary" className="ml-2">Pending</Badge>;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Teaching Tools
        </CardTitle>
        <CardDescription>
          Access your classroom management features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachingTools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              className={`h-20 flex-col gap-2 p-4 ${tool.color} border-2 transition-all duration-200 hover:shadow-md`}
              onClick={() => onActionClick(tool.id)}
            >
              <div className="flex items-center gap-2">
                <tool.icon className="h-5 w-5" />
                {getUrgencyBadge(tool.id)}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{tool.label}</div>
                <div className="text-xs opacity-75">{tool.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {stats?.classCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Classes</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {stats?.todayAttendance || 0}
              </div>
              <div className="text-xs text-muted-foreground">Today's Attendance</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {stats?.pendingGrades || 0}
              </div>
              <div className="text-xs text-muted-foreground">Pending Grades</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherToolsSection;
