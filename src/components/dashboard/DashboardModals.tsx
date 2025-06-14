
import React from 'react';
import { AuthUser } from '@/types/auth';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  user: AuthUser;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({ activeModal, onClose, user }) => {
  console.log('🔧 DashboardModals: Active modal:', activeModal);

  // For now, we'll just return null since specific modals aren't implemented yet
  // This prevents the import error and allows the dashboard to render
  if (!activeModal) {
    return null;
  }

  // TODO: Implement specific modals based on activeModal type
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Modal: {activeModal}</h3>
        <p className="text-gray-600 mb-4">
          This modal functionality will be implemented based on the modal type: {activeModal}
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DashboardModals;
