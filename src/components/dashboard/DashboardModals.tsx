
import React from 'react';
import { AuthUser } from '@/types/auth';
import CreateUserModal from './modals/CreateUserModal';
import CreateSchoolModal from './modals/CreateSchoolModal';
import SystemConfigModal from './modals/SystemConfigModal';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  user: AuthUser;
  onDataChanged: () => void;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({
  activeModal,
  onClose,
  user,
  onDataChanged
}) => {
  console.log('[DashboardModals] Rendering modal:', activeModal);

  if (!activeModal) return null;

  const handleSuccess = () => {
    console.log('[DashboardModals] Modal operation successful');
    onDataChanged();
  };

  switch (activeModal) {
    case 'create-user':
      return (
        <CreateUserModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'create-school':
      return (
        <CreateSchoolModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'system-config':
    case 'maintenance-mode':
    case 'database-settings':
    case 'security-settings':
    case 'notification-settings':
    case 'user-management':
    case 'company-details':
      return (
        <SystemConfigModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    default:
      console.warn('[DashboardModals] Unknown modal type:', activeModal);
      return null;
  }
};

export default DashboardModals;
