
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import PrincipalStatsCards from './principal/PrincipalStatsCards';
import PrincipalAnalyticsOverview from './principal/PrincipalAnalyticsOverview';
import FinancialOverviewReadOnly from './shared/FinancialOverviewReadOnly';
import CertificatesList from '@/components/certificates/CertificatesList';
import AddSubjectModal from '@/components/modals/AddSubjectModal';
import SubjectAssignmentModal from '@/components/modals/SubjectAssignmentModal';
import CertificateGenerator from '@/components/certificates/CertificateGenerator';
import TimetableGenerator from '@/components/timetable/TimetableGenerator';
import PrincipalReportGenerator from '@/components/reports/PrincipalReportGenerator';
import PrincipalTimetableCard from './principal/PrincipalTimetableCard';
import PrincipalGradesManager from './principal/PrincipalGradesManager';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrincipalDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🎓 PrincipalDashboard: Rendering for principal:', user.email);
  
  const { schoolId, isReady, validateSchoolAccess } = useSchoolScopedData();
  const { stats, loading, error, refetch } = usePrincipalDashboardData(schoolId);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Enhanced school assignment validation
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!schoolId) {
    console.error('❌ Principal Dashboard: No school assignment found for user:', user.email);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No school assignment found. Please contact your administrator to assign you to a school.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Validate user has access to this school
  if (!validateSchoolAccess(schoolId)) {
    console.error('❌ Principal Dashboard: Access denied to school:', schoolId);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You do not have permission to view this school's data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleModalOpen = (modalType: string) => {
    console.log('🎭 PrincipalDashboard: Opening modal:', modalType, 'for school:', schoolId);
    
    // Validate modal access based on school context
    if (!schoolId) {
      toast({
        title: "Access Error",
        description: "Cannot open modal - no school context available.",
        variant: "destructive"
      });
      return;
    }

    setActiveModal(modalType);
    
    // Delegate specific modals to parent if available
    if (onModalOpen && ['studentAdmission', 'teacherAdmission', 'addClass'].includes(modalType)) {
      onModalOpen(modalType);
    }
  };

  const handleModalClose = () => {
    console.log('🎭 PrincipalDashboard: Closing modal:', activeModal);
    setActiveModal(null);
  };

  const handleSuccess = (message?: string) => {
    console.log('✅ PrincipalDashboard: Operation completed successfully');
    toast({
      title: "Success",
      description: message || "Operation completed successfully.",
    });
    setActiveModal(null);
    
    // Refresh dashboard data after successful operations
    if (refetch) {
      refetch();
    }
  };

  const handleError = (error: string) => {
    console.error('❌ PrincipalDashboard: Operation failed:', error);
    toast({
      title: "Operation Failed",
      description: error || "An error occurred while processing your request.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Key Statistics Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">School Overview</h2>
          <PrincipalStatsCards 
            stats={stats} 
            loading={loading} 
            error={error}
          />
        </section>
        
        {/* School Analytics Overview Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">School Analytics Overview</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <PrincipalAnalyticsOverview />
          </div>
        </section>

        {/* Grade Management Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Grade Management</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <PrincipalGradesManager 
              schoolId={schoolId}
              onModalOpen={handleModalOpen}
            />
          </div>
        </section>

        {/* Timetable Management Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Timetable Management</h2>
          <div className="bg-white rounded-lg border shadow-sm">
            <PrincipalTimetableCard />
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
      
      {/* Enhanced Modal Management with School Context */}
      {activeModal === 'add-subject' && (
        <AddSubjectModal
          open={true}
          onClose={handleModalClose}
          onSubjectCreated={handleSuccess}
        />
      )}

      {activeModal === 'assign-subject' && (
        <SubjectAssignmentModal
          open={true}
          onClose={handleModalClose}
          onAssignmentCreated={handleSuccess}
        />
      )}

      {activeModal === 'generate-certificate' && (
        <CertificateGenerator
          open={true}
          onClose={handleModalClose}
          onCertificateGenerated={handleSuccess}
        />
      )}

      {activeModal === 'generate-timetable' && (
        <TimetableGenerator
          open={true}
          onClose={handleModalClose}
          onTimetableGenerated={handleSuccess}
        />
      )}

      {activeModal === 'reports' && (
        <PrincipalReportGenerator
          open={true}
          onClose={handleModalClose}
          onReportGenerated={handleSuccess}
        />
      )}
    </div>
  );
};

export default PrincipalDashboard;
