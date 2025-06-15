import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import FinanceAdminSummary from './FinanceAdminSummary';
import FinanceOfficerDashboard from '../dashboard/FinanceOfficerDashboard';
import ParentFinanceView from '../finance/ParentFinanceView';

const FinanceModule: React.FC = () => {
  const { user } = useAuth();
  
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [outstandingFees, setOutstandingFees] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isSummaryRole = user?.role && ['edufam_admin', 'school_owner', 'principal'].includes(user.role);

  useEffect(() => {
    if (!isSummaryRole) {
        setLoading(false);
        return;
    }
    
    if (user.role === 'edufam_admin') {
      supabase.from("schools")
        .select("id, name")
        .then(({ data, error }) => {
          if (error) setError("Failed to fetch schools list.");
          else setSchools(data || []);
        });
    }

    const effectiveSchoolId = user.role === 'edufam_admin' ? schoolFilter : user.school_id;

    if (!effectiveSchoolId) {
        setFinanceSummary(null);
        setOutstandingFees(null);
        if (user.role !== 'edufam_admin') {
            setError("Your account is not associated with a school.");
        }
        setLoading(false);
        return;
    }

    const fetchFinanceData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: summaryData, error: summaryError } = await supabase
                .from("school_finance_summary")
                .select("*")
                .eq("school_id", effectiveSchoolId)
                .maybeSingle();

            if (summaryError) throw summaryError;
            setFinanceSummary(summaryData);

            const { data: outstanding, error: feesError } = await supabase.rpc('get_outstanding_fees', {
                p_school_id: effectiveSchoolId,
            });

            if (feesError) throw feesError;
            setOutstandingFees(outstanding);

        } catch (err: any) {
            setError("Could not load financial summary data.");
            setFinanceSummary(null);
            setOutstandingFees(null);
        } finally {
            setLoading(false);
        }
    };

    fetchFinanceData();
  }, [isSummaryRole, user?.role, user?.school_id, schoolFilter]);

  const renderForSummaryRole = () => {
    if (loading) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (user?.role === 'edufam_admin' && !schoolFilter && schools.length > 0) {
      return <FinanceAdminSummary schools={schools} schoolFilter={schoolFilter} setSchoolFilter={setSchoolFilter} financeSummary={null} loading={false} error={null} />;
    }
    if (!financeSummary && outstandingFees === null) {
      const message = user?.role === 'edufam_admin' && schools.length === 0
        ? "No schools found."
        : "There is no financial summary available for this school.";
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return (
      <FinanceAdminSummary
        loading={loading}
        error={null}
        financeSummary={{
          total_collected: financeSummary?.total_collected ?? 0,
          outstanding: outstandingFees, 
          major_expenses: '—'
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'edufam_admin':
    case 'school_owner':
    case 'principal':
      return renderForSummaryRole();
    case 'finance_officer':
      return <FinanceOfficerDashboard user={user} onModalOpen={() => {}} />;
    case 'parent':
      return <ParentFinanceView />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
          <p className="text-gray-500">Your role ({user.role}) does not have access to the finance module.</p>
        </div>
      );
  }
};

export default FinanceModule;
