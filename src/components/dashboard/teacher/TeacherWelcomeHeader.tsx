
import React from 'react';
import { AuthUser } from '@/types/auth';

interface TeacherWelcomeHeaderProps {
  user: AuthUser;
}

const TeacherWelcomeHeader: React.FC<TeacherWelcomeHeaderProps> = ({ user }) => (
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome back, {user.name}! Ready to inspire young minds today?
      </p>
    </div>
  </div>
);

export default TeacherWelcomeHeader;
