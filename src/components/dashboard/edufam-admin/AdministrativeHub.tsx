
import React from 'react';
import SystemManagementGrid from './SystemManagementGrid';

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated?: () => void;
}

const AdministrativeHub = ({ onModalOpen, onUserCreated }: AdministrativeHubProps) => {
  
  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'users':
        onModalOpen('createUser');
        break;
      case 'schools':
        onModalOpen('createSchool');
        break;
      case 'analytics':
        console.log('Navigate to analytics');
        break;
      case 'billing':
        console.log('Navigate to billing');
        break;
      case 'system-health':
        console.log('Navigate to system health');
        break;
      case 'security':
        console.log('Navigate to security');
        break;
      case 'support':
        console.log('Navigate to support');
        break;
      case 'database':
        console.log('Navigate to database');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  return <SystemManagementGrid onActionClick={handleActionClick} />;
};

export default AdministrativeHub;
