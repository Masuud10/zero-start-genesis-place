
import React from 'react';
import { AuthUser } from '@/types/auth';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  user: AuthUser;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({ activeModal, onClose, user }) => {
  if (!activeModal) {
    return null;
  }

  let modalContent = null;
  let title = '';

  // Render real management modules/components for each modal type
  switch (activeModal) {
    case 'schools':
      modalContent = <SchoolsModule />;
      title = "Manage Schools";
      break;
    case 'users':
      modalContent = <UsersModule />;
      title = "Manage Users";
      break;
    case 'analytics':
      modalContent = <AnalyticsDashboard />;
      title = "System Analytics";
      break;
    default:
      modalContent = (
        <div>
          <p className="text-gray-600 mb-4">
            This modal functionality will be implemented based on the modal type: {activeModal}
          </p>
        </div>
      );
      title = `Modal: ${activeModal}`;
      break;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="ml-4 px-3 py-1 rounded text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          {modalContent}
        </div>
      </div>
    </div>
  );
};

export default DashboardModals;
