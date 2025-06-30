
import React from 'react';
import { AuthUser } from '@/types/auth';
import CreateSchoolDialog from '@/components/school/CreateSchoolDialog';
import DatabaseSettingsModal from './modals/DatabaseSettingsModal';
import MaintenanceModeModal from './modals/MaintenanceModeModal';

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

  if (!activeModal) {
    return null;
  }

  const handleSuccess = () => {
    console.log('[DashboardModals] Modal action successful');
    onDataChanged();
    onClose();
  };

  switch (activeModal) {
    case 'create-school':
      return (
        <CreateSchoolDialog onSchoolCreated={handleSuccess}>
          <div></div>
        </CreateSchoolDialog>
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

    case 'maintenance-mode':
      return (
        <MaintenanceModeModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case 'create-admin':
    case 'create-owner':
    case 'create-principal':
    case 'create-teacher':
    case 'assign-owner':
    case 'school-settings':
    case 'school-analytics':
    case 'system-health':
    case 'security-audit':
    case 'performance-metrics':
    case 'system-settings':
    case 'view-school-details':
    case 'manage-school':
    case 'view-all-schools':
      console.log(`[DashboardModals] Modal ${activeModal} not implemented yet`);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {activeModal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <p className="mb-4">This feature is coming soon.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      );

    default:
      console.warn('[DashboardModals] Unknown modal type:', activeModal);
      return null;
  }
};

export default DashboardModals;
