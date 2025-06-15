import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { DollarSign, Users, CreditCard, BarChart3, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

      // 1. Monthly revenue (sum of paid_amount from fees this month)
      const currMonth = (new Date().getMonth() + 1).toString().padStart(2,'0');
      const currYear = new Date().getFullYear();
      const monthStart = `${currYear}-${currMonth}-01`;
      const { data: fees } = await supabase
        .from('fees')
        .select('amount, paid_amount, paid_date, mpesa_code')
        .eq('school_id', user.school_id);

      let monthlyRevenue = 0;
      let outstandingFees = 0;
      let paymentRate = 0;
      let mpesaTransactions = 0;

      if (fees) {
        const thisMonthFees = fees.filter(f => f.paid_date && (new Date(f.paid_date)).getMonth() + 1 === Number(currMonth));
        monthlyRevenue = thisMonthFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

        // Outstanding = sum of (amount - paid_amount) for all due, status!=paid
        outstandingFees = fees.reduce((sum, f) => sum + ((f.amount || 0) - (f.paid_amount || 0)), 0);

        // Payment rate = total paid / total amount
        const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
        const totalAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
        paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

        // MPESA transactions = count where mpesa_code is set
        mpesaTransactions = fees.filter(f => f.mpesa_code).length;
      }

      setStats({
        monthlyRevenue,
        outstandingFees,
        paymentRate,
        mpesaTransactions
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.school_id]);

  const financeActions = [
    { id: 'finance', label: 'Fee Management', icon: DollarSign, description: 'Process payments & fees' },
    { id: 'students', label: 'Student Accounts', icon: Users, description: 'View student balances' },
    { id: 'reports', label: 'Financial Reports', icon: FileText, description: 'Generate reports' },
    { id: 'analytics', label: 'Finance Analytics', icon: BarChart3, description: 'Payment insights' },
  ];

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

      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <span className="animate-pulse">...</span> : `KES ${stats.monthlyRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.monthlyRevenue === 0 ? "No revenue" : "+ this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? <span className="animate-pulse">...</span> : `KES ${stats.outstandingFees.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.outstandingFees === 0 ? "All paid" : "Outstanding fees"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <span className="animate-pulse">...</span> : `${stats.paymentRate.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.paymentRate === 0 ? "No payments yet" : "Current term"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? <span className="animate-pulse">...</span> : stats.mpesaTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "" : stats.mpesaTransactions === 0 ? "No transactions" : "This month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Management
          </CardTitle>
          <CardDescription>
            Access financial management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financeActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-24 flex-col gap-2 p-4"
                onClick={() => onModalOpen(action.id)}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceOfficerDashboard;
