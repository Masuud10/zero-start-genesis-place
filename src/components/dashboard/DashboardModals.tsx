
import React from 'react';
import { AuthUser } from '@/types/auth';
import CreateUserModal from './modals/CreateUserModal';
import CreateSchoolModal from './modals/CreateSchoolModal';
import SystemConfigModal from './modals/SystemConfigModal';
import MaintenanceModeModal from './modals/MaintenanceModeModal';
import DatabaseSettingsModal from './modals/DatabaseSettingsModal';
import SecuritySettingsModal from './modals/SecuritySettingsModal';
import NotificationSettingsModal from './modals/NotificationSettingsModal';
import UserManagementModal from './modals/UserManagementModal';
import CompanyDetailsModal from './modals/CompanyDetailsModal';

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
    case 'create-admin':
    case 'create-owner':
    case 'create-principal':
    case 'create-teacher':
      return (
        <CreateUserModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
          initialRole={activeModal === 'create-admin' ? 'edufam_admin' : 
                     activeModal === 'create-owner' ? 'school_owner' :
                     activeModal === 'create-principal' ? 'principal' :
                     activeModal === 'create-teacher' ? 'teacher' : 'parent'}
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
    
    case 'maintenance-mode':
      return (
        <MaintenanceModeModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'database-settings':
      return (
        <DatabaseSettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'security-settings':
      return (
        <SecuritySettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'notification-settings':
      return (
        <NotificationSettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'user-management':
      return (
        <UserManagementModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'company-details':
      return (
        <CompanyDetailsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );
    
    case 'system-config':
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
