
import React from 'react';
import { AuthUser } from '@/types/auth';
import { School } from '@/types/school';

interface DashboardHeaderProps {
  user: AuthUser;
  currentSchool?: School | null;
  onLogout: () => Promise<void>;
}

// This component is now deprecated in favor of DashboardContainer
// keeping for backward compatibility but content moved to DashboardContainer
const DashboardHeader = ({ user, currentSchool, onLogout }: DashboardHeaderProps) => {
  return null; // Content moved to DashboardContainer
};

export default DashboardHeader;
