
import React from 'react';
import { AuthUser } from '@/types/auth';
import EduFamAdminDashboard from './EduFamAdminDashboard';

interface SystemAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🔧 SystemAdminDashboard: Rendering for system admin:', user.email);
  
  // For system admins (elimisha_admin), we use the same dashboard as EduFam admins
  return <EduFamAdminDashboard onModalOpen={onModalOpen} />;
};

export default SystemAdminDashboard;
