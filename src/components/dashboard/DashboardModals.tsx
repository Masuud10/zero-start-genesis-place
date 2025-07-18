import React from "react";
import { AuthUser } from "@/types/auth";

import DatabaseSettingsModal from "./modals/DatabaseSettingsModal";
import MaintenanceModeModal from "./modals/MaintenanceModeModal";
import UserManagementModal from "./modals/UserManagementModal";
import SecuritySettingsModal from "./modals/SecuritySettingsModal";
import NotificationSettingsModal from "./modals/NotificationSettingsModal";
import CompanyDetailsModal from "./modals/CompanyDetailsModal";
import CreateUserModal from "./modals/CreateUserModal";
import SystemConfigModal from "./modals/SystemConfigModal";

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
  onDataChanged,
}) => {
  console.log("[DashboardModals] Rendering modal:", activeModal);

  if (!activeModal) {
    return null;
  }

  const handleSuccess = () => {
    console.log("[DashboardModals] Modal action successful");
    onDataChanged();
    onClose();
  };

  switch (activeModal) {
    case "create-school":
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create School</h3>
            <p className="mb-4">School creation feature coming soon.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      );

    case "database-settings":
      return (
        <DatabaseSettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "maintenance-mode":
      return (
        <MaintenanceModeModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "user-management":
      return (
        <UserManagementModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "create-admin":
    case "create-owner":
    case "create-principal":
    case "create-teacher":
      return (
        <CreateUserModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          initialRole={activeModal.replace("create-", "")}
          currentUser={user}
        />
      );

    case "security-settings":
    case "security-audit":
      return (
        <SecuritySettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "notification-settings":
      return (
        <NotificationSettingsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "company-details":
      return (
        <CompanyDetailsModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "system-config":
    case "system-settings":
      return (
        <SystemConfigModal
          isOpen={true}
          onClose={onClose}
          onSuccess={handleSuccess}
          currentUser={user}
        />
      );

    case "assign-owner":
    case "school-settings":
    case "school-analytics":
    case "system-health":
    case "performance-metrics":
    case "view-school-details":
    case "manage-school":
    case "view-all-schools":
      console.log(`[DashboardModals] Modal ${activeModal} not implemented yet`);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {activeModal
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
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
      console.warn("[DashboardModals] Unknown modal type:", activeModal);
      return null;
  }
};

export default DashboardModals;
