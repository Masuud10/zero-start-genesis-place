
import React from 'react';
import { AuthUser } from '@/types/auth';
import SchoolsModule from '@/components/modules/SchoolsModule';
import UsersModule from '@/components/modules/UsersModule';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ParentGradesView from '@/components/grades/ParentGradesView';
import ParentAttendanceView from '@/components/attendance/ParentAttendanceView';
import ParentFinanceView from '@/components/finance/ParentFinanceView';
import MessagesModule from '@/components/modules/MessagesModule';
import ParentTimetableView from '@/components/timetable/ParentTimetableView';
import ParentReportsModule from '@/components/modules/ParentReportsModule';

interface DashboardModalsProps {
  activeModal: string | null;
  onClose: () => void;
  user: AuthUser | null;
  onDataChanged?: () => void;
}

/**
 * This modal manager opens the requested modal ("schools", "users", "analytics", etc)
 * and handles data refreshing and closing.
 */
const DashboardModals: React.FC<DashboardModalsProps> = ({
  activeModal,
  onClose,
  user,
  onDataChanged,
}) => {
  React.useEffect(() => {
    if (activeModal) {
      console.log('[DashboardModals] Opening modal:', activeModal);
    }
  }, [activeModal]);

  if (!activeModal) {
    return null;
  }

  let modalContent = null;
  let title = '';

  // If content changes data, wrap callback to parent dashboard
  const handleDataChanged = () => {
    console.log('[DashboardModals] Data in modal changed, calling parent');
    if (onDataChanged) {
      onDataChanged();
    } else {
      onClose();
    }
  };

  switch (activeModal) {
    case 'schools':
      modalContent = <SchoolsModule onDataChanged={handleDataChanged} />;
      title = "Manage Schools";
      break;
    case 'users':
      modalContent = <UsersModule onDataChanged={handleDataChanged} />;
      title = "Manage Users";
      break;
    case 'analytics':
      modalContent = <AnalyticsDashboard />;
      title = "System Analytics";
      break;
    case 'grades':
      modalContent = <ParentGradesView />;
      title = "Child Grade Records";
      break;
    case 'attendance':
      modalContent = <ParentAttendanceView />;
      title = "Child Attendance Records";
      break;
    case 'finance':
      modalContent = <ParentFinanceView />;
      title = "Financial Overview";
      break;
    case 'messages':
      modalContent = <MessagesModule />;
      title = "School Messages";
      break;
    case 'timetable':
      modalContent = <ParentTimetableView />;
      title = "Class Timetable";
      break;
    case 'reports':
      modalContent = <ParentReportsModule />;
      title = "Generate Reports";
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
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4 border-b pb-2 dark:border-gray-700">
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
