
import React from 'react';
import { User } from '@/types/auth';
import { School } from '@/types/school';
import DashboardGreeting from './DashboardGreeting';
import UserProfileDropdown from './UserProfileDropdown';

interface DashboardHeaderProps {
  user: User;
  currentSchool?: School | null;
  onLogout: () => Promise<void>;
}

const DashboardHeader = ({ user, currentSchool, onLogout }: DashboardHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between py-4 md:py-6">
          <DashboardGreeting user={user} currentSchool={currentSchool} />
          <UserProfileDropdown user={user} currentSchool={currentSchool} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
