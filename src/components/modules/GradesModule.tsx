import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import GradesAdminSummary from './GradesAdminSummary';
import ParentGradesView from '../grades/ParentGradesView';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import BulkGradingModal from '../grading/BulkGradingModal';
import NoGradebookPermission from '../grades/NoGradebookPermission';
import BulkGradingQuickAction from '../dashboard/principal/BulkGradingQuickAction';

const GradesModule: React.FC = () => {
  const { user } = useAuth();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { hasPermission } = usePermissions(user?.role as UserRole, user?.school_id);

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [gradesSummary, setGradesSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  const isSummaryRole = user?.role && ['edufam_admin', 'principal', 'school_owner'].includes(user.role);

  useEffect(() => {
    if (!isSummaryRole) {
        setLoadingSummary(false);
        return;
    }
    setLoadingSummary(true);
    setErrorSummary(null);

    if (user.role === 'edufam_admin') {
        supabase.from("schools").select("id, name")
            .then(({ data, error }) => {
                if (error) setErrorSummary("Failed to fetch schools list.");
                else setSchools(data || []);
            });
    }

    const effectiveSchoolId = user.role === 'edufam_admin' ? schoolFilter : user.school_id;

    if (!effectiveSchoolId && user.role === 'edufam_admin' && !schoolFilter) {
        setGradesSummary(null);
        setLoadingSummary(false);
        return;
    }

    if (!effectiveSchoolId) {
        setErrorSummary("Your account is not associated with a school.");
        setLoadingSummary(false);
        return;
    }

    let query = supabase.from("school_grades_summary").select("*").eq("school_id", effectiveSchoolId);

    query.then(({ data, error }: any) => {
        if (error) {
            setErrorSummary("Could not load grades summary data.");
            setGradesSummary(null);
        } else if (!data || data.length === 0) {
            setGradesSummary(null);
        } else {
            setGradesSummary(data[0]);
        }
        setLoadingSummary(false);
    });
  }, [isSummaryRole, user?.role, user?.school_id, schoolFilter]);

  const renderForSummaryRole = () => {
    if (loadingSummary) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (errorSummary) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{errorSummary}</AlertDescription>
        </Alert>
      );
    }
    if (user?.role === 'edufam_admin' && !schoolFilter && schools.length > 0) {
        return <GradesAdminSummary schools={schools} schoolFilter={schoolFilter} setSchoolFilter={setSchoolFilter} gradesSummary={null} loading={false} error={null} />;
    }
    if (!gradesSummary) {
      const message = user?.role === 'edufam_admin' && schools.length === 0
        ? "No schools found."
        : "There is no grades summary available for this school.";
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return (
      <GradesAdminSummary
        loading={loadingSummary}
        error={null}
        gradesSummary={{
          avg_grade: gradesSummary.average_grade ?? null,
          most_improved_school: '—',
          declining_alerts: 0
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  };
  
  if (!user) return <div>Loading...</div>;

  if (user.role !== 'parent' && !hasPermission('view_gradebook')) {
      return <NoGradebookPermission role={user.role} hasPermission={false} />;
  }

  switch (user.role) {
    case 'edufam_admin':
    case 'school_owner':
      return renderForSummaryRole();
    case 'principal':
        return (
            <div className="space-y-6">
                {renderForSummaryRole()}
                <div className="pt-6 border-t">
                  <BulkGradingQuickAction onOpenBulkGrade={() => setShowBulkModal(true)} />
                </div>
                {showBulkModal && <BulkGradingModal onClose={() => setShowBulkModal(false)} />}
            </div>
        );
    case 'teacher':
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grade Management
              </h1>
              <p className="text-muted-foreground">
                Enter and manage student grades for your classes.
              </p>
            </div>
          </div>
          
          <BulkGradingQuickAction onOpenBulkGrade={() => setShowBulkModal(true)} />

          {showBulkModal && <BulkGradingModal onClose={() => setShowBulkModal(false)} />}
        </div>
      );
    case 'parent':
      return <ParentGradesView />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
          <p className="text-gray-500">Your role ({user.role}) does not have access to the grades module.</p>
        </div>
      );
  }
};

export default GradesModule;
