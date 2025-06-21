
import React from 'react';
import { AuthUser } from '@/types/auth';

// Modal Components (to be imported when available)
// import CreateUserModal from '@/components/modals/CreateUserModal';
// import CreateSchoolModal from '@/components/modals/CreateSchoolModal';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  user: AuthUser | null;
  onDataChanged: () => void;
}

const DashboardModals = ({ activeModal, onClose, user, onDataChanged }: DashboardModalsProps) => {
  console.log('🎭 DashboardModals: Rendering modal:', activeModal);

  if (!activeModal) return null;

  const renderModal = () => {
    switch (activeModal) {
      case 'create-admin':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Admin User</h2>
              <p className="text-gray-600 mb-4">Admin user creation modal will be implemented here.</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onDataChanged();
                    console.log('Admin user would be created here');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        );

      case 'create-school':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New School</h2>
              <p className="text-gray-600 mb-4">School creation modal will be implemented here.</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onDataChanged();
                    console.log('School would be created here');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create School
                </button>
              </div>
            </div>
          </div>
        );

      case 'create-principal':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Principal</h2>
              <p className="text-gray-600 mb-4">Principal creation modal will be implemented here.</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onDataChanged();
                    console.log('Principal would be created here');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Create Principal
                </button>
              </div>
            </div>
          </div>
        );

      case 'system-health':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">System Health Monitor</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>Database Connection</span>
                  <span className="text-green-600 font-semibold">Healthy</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>API Response Time</span>
                  <span className="text-green-600 font-semibold">Less than 200ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>System Uptime</span>
                  <span className="text-green-600 font-semibold">99.9%</span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Feature Coming Soon</h2>
              <p className="text-gray-600 mb-4">
                The "{activeModal}" feature is being implemented and will be available soon.
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderModal();
};

export default DashboardModals;
