
import React from 'react';
import GradesModal from "../modals/GradesModal";
import AttendanceModal from "../modals/AttendanceModal";
import ResultsModal from "../modals/ResultsModal";
import ReportsModal from "../modals/ReportsModal";
import FeeCollectionModal from "../modals/FeeCollectionModal";
import FinancialReportsModal from "../modals/FinancialReportsModal";
import { User } from '@/types/auth';

interface DashboardModalsProps {
  activeModal: string | null;
  user: User;
  onClose: () => void;
}

const DashboardModals = ({ activeModal, user, onClose }: DashboardModalsProps) => {
  return (
    <>
      {activeModal === "grades" && (
        <GradesModal onClose={onClose} userRole={user?.role as any} />
      )}
      {activeModal === "attendance" && (
        <AttendanceModal onClose={onClose} userRole={user?.role as any} />
      )}
      {activeModal === "results" && <ResultsModal onClose={onClose} />}
      {activeModal === "reports" && <ReportsModal onClose={onClose} />}
      {activeModal === "fee-collection" && (
        <FeeCollectionModal onClose={onClose} />
      )}
      {activeModal === "financial-reports" && (
        <FinancialReportsModal onClose={onClose} />
      )}
    </>
  );
};

export default DashboardModals;
