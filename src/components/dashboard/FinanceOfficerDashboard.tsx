
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { DollarSign, Users, CreditCard, BarChart3, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FinanceStatsCards from "./finance-officer/FinanceStatsCards";
import FinanceActionsPanel from "./finance-officer/FinanceActionsPanel";

interface FinanceOfficerDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({ user, onModalOpen }) => {
  console.log('💰 FinanceOfficerDashboard: Rendering for finance officer:', user.email);

  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    outstandingFees: 0,
    paymentRate: 0,
    mpesaTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      if (!user?.school_id) {
        setLoading(false);
        return;
      }
      
      const schoolId = user.school_id;

      const outstandingFeesPromise = supabase.rpc('get_outstanding_fees', { p_school_id: schoolId });
      
      const feesPromise = supabase
        .from('fees')
        .select('amount, paid_amount, paid_date, mpesa_code')
        .eq('school_id', schoolId);

      const [
        { data: outstandingFeesData, error: outstandingError },
        { data: fees, error: feesError }
      ] = await Promise.all([outstandingFeesPromise, feesPromise]);


      if (outstandingError || feesError) {
        console.error("Error fetching finance stats", outstandingError, feesError);
        setLoading(false);
        return;
      }

      let monthlyRevenue = 0;
      let paymentRate = 0;
      let mpesaTransactions = 0;

      if (fees) {
        const currMonth = new Date().getMonth();
        const currYear = new Date().getFullYear();
        
        const thisMonthFees = fees.filter(f => {
            if (!f.paid_date) return false;
            const paidDate = new Date(f.paid_date);
            return paidDate.getMonth() === currMonth && paidDate.getFullYear() === currYear;
        });

        monthlyRevenue = thisMonthFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

        const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
        const totalAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
        paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

        mpesaTransactions = fees.filter(f => f.mpesa_code).length;
      }

      setStats({
        monthlyRevenue,
        outstandingFees: outstandingFeesData || 0,
        paymentRate,
        mpesaTransactions
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.school_id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome {user.name}! Monitor and manage school finances.
          </p>
        </div>
      </div>
      <FinanceStatsCards loading={loading} stats={stats} />
      {/* Finance Actions */}
      <div className="w-full">
        <div className="mt-4">
          <div className="mb-2">
            <span className="font-semibold text-lg flex items-center gap-2"><FinanceActionsPanel onModalOpen={onModalOpen} /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceOfficerDashboard;
