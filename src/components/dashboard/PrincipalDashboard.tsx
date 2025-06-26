
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalActionButtons from './principal/PrincipalActionButtons';
import PrincipalGradesModule from '@/components/modules/PrincipalGradesModule';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import CertificatesList from '@/components/certificates/CertificatesList';
import AddSubjectModal from '@/components/modals/AddSubjectModal';
import SubjectAssignmentModal from '@/components/modals/SubjectAssignmentModal';
import CertificateGenerator from '@/components/certificates/CertificateGenerator';
import PrincipalTimetableCard from './principal/PrincipalTimetableCard';
import { useToast } from '@/hooks/use-toast';

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🎓 PrincipalDashboard: Rendering for principal:', user.email);
  const { stats, loading, error } = usePrincipalDashboardData(0);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleModalOpen = (modalType: string) => {
    console.log('PrincipalDashboard: Opening modal:', modalType);
    setActiveModal(modalType);
    
    // Delegate some modals to parent if available
    if (onModalOpen && ['reports', 'studentAdmission', 'teacherAdmission', 'addClass'].includes(modalType)) {
      onModalOpen(modalType);
    }
  };

  const handleModalClose = () => {
    console.log('PrincipalDashboard: Closing modal:', activeModal);
    setActiveModal(null);
  };

  const handleSubjectCreated = () => {
    console.log('Subject created successfully');
    toast({
      title: "Success",
      description: "Subject has been created successfully.",
    });
    setActiveModal(null);
  };

  const handleAssignmentCreated = () => {
    console.log('Assignment created successfully');
    toast({
      title: "Success",
      description: "Teacher assignment has been created successfully.",
    });
    setActiveModal(null);
  };

  const handleCertificateGenerated = () => {
    console.log('Certificate generated successfully');
    toast({
      title: "Success",
      description: "Certificate has been generated successfully.",
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Key Statistics Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">School Overview</h2>
          <PrincipalStatsCards stats={stats} loading={loading} error={error} />
        </section>
        
        {/* Quick Actions Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <PrincipalActionButtons onModalOpen={handleModalOpen} />
          </div>
        </section>

        {/* Academic Management Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Management */}
            <PrincipalGradesModule />
            
            {/* Timetable Management */}
            <div className="bg-white rounded-lg border shadow-sm">
              <PrincipalTimetableCard />
            </div>
          </div>
        </section>

        {/* Financial Overview Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <FinancialOverviewReadOnly />
          </div>
        </section>
        
        {/* Certificates Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificates & Documents</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <CertificatesList />
          </div>
        </section>
      </div>
      
      {/* Modals */}
      <AddSubjectModal
        open={activeModal === 'add-subject'}
        onClose={handleModalClose}
        onSubjectCreated={handleSubjectCreated}
      />

      <SubjectAssignmentModal
        open={activeModal === 'assign-subject'}
        onClose={handleModalClose}
        onAssignmentCreated={handleAssignmentCreated}
      />

      <CertificateGenerator
        open={activeModal === 'generate-certificate'}
        onClose={handleModalClose}
        onCertificateGenerated={handleCertificateGenerated}
      />
    </div>
  );
};

export default PrincipalDashboard;
