
import React from 'react';
import { AuthUser } from '@/types/auth';

interface PrincipalWelcomeHeaderProps {
  user: AuthUser | null;
}

const PrincipalWelcomeHeader: React.FC<PrincipalWelcomeHeaderProps> = ({ user }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Principal Dashboard
      </h1>
      <p className="text-gray-600 text-sm">
        Welcome back, {user?.name || 'Principal'}! Manage your school effectively.
      </p>
    </div>
  );
};

export default PrincipalWelcomeHeader;
