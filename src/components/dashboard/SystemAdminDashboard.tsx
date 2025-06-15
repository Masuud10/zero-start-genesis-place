
import React from 'react';
import { AuthUser } from '@/types/auth';
import EduFamAdminDashboard from './EduFamAdminDashboard';
import RoleGuard from '@/components/common/RoleGuard';

interface SystemAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🔧 SystemAdminDashboard: Rendering for system admin:', user.email);
  
  // For system admins (elimisha_admin), we use the same dashboard as EduFam admins
  return (
    <RoleGuard allowedRoles={['edufam_admin', 'elimisha_admin']} requireSchoolAssignment={false}>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-2xl text-gray-900">System Admin Dashboard</span>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-500 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </div>
            <div className="flex items-center space-x-2 bg-white/60 rounded-lg px-2 py-1 border border-white/40 mt-1">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{user?.name?.[0] || "U"}</span>
              </div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900 text-xs">{user.email?.split('@')[0]}</div>
                <div className="text-gray-500 text-[10px]">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
        <EduFamAdminDashboard onModalOpen={onModalOpen} />
      </div>
    </RoleGuard>
  );
};

export default SystemAdminDashboard;

