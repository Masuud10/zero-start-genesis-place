
import React from 'react';
import { AuthUser } from '@/types/auth';

interface SchoolAdminWelcomeHeaderProps {
  user: AuthUser;
}

const SchoolAdminWelcomeHeader: React.FC<SchoolAdminWelcomeHeaderProps> = ({ user }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">School Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's what's happening at your school.
        </p>
      </div>
    </div>
  );
};

export default SchoolAdminWelcomeHeader;
