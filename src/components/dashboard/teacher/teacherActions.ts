
import { GraduationCap, Users, CalendarCheck, BookOpen, MessageSquare } from 'lucide-react';

export const teacherActions = [
  { id: 'grades', label: 'My Classes Grades', icon: GraduationCap, description: 'Grade student work' },
  { id: 'attendance', label: 'Take Attendance', icon: CalendarCheck, description: 'Mark daily attendance' },
  { id: 'students', label: 'My Students', icon: Users, description: 'View student profiles' },
  { id: 'timetable', label: 'My Schedule', icon: BookOpen, description: 'View teaching schedule' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communicate with parents' },
];
