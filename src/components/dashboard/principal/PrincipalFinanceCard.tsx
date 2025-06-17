
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Eye, FileText } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinanceData {
  totalRevenue: number;
  totalPending: number;
  collectionRate: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    studentName: string;
    paymentMethod: string;
    date: string;
  }>;
}

const PrincipalFinanceCard = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalRevenue: 0,
    totalPending: 0,
    collectionRate: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, [schoolId]);

  const fetchFinanceData = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);

      // Fetch financial summary
      const [revenueRes, pendingRes, transactionsRes] = await Promise.all([
        supabase
          .from('fees')
          .select('paid_amount')
          .eq('school_id', schoolId)
          .eq('status', 'paid'),
        supabase
          .from('fees')
          .select('amount, paid_amount')
          .eq('school_id', schoolId)
          .in('status', ['pending', 'partial']),
        supabase
          .from('financial_transactions')
          .select(`
            id,
            amount,
            payment_method,
            created_at,
            students!inner(name)
          `)
          .eq('school_id', schoolId)
          .eq('transaction_type', 'payment')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const totalPending = pendingRes.data?.reduce((sum, fee) => sum + ((fee.amount || 0) - (fee.paid_amount || 0)), 0) || 0;
      const collectionRate = totalRevenue + totalPending > 0 ? (totalRevenue / (totalRevenue + totalPending)) * 100 : 0;

      const recentTransactions = transactionsRes.data?.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        studentName: transaction.students?.name || 'Unknown',
        paymentMethod: transaction.payment_method || 'Unknown',
        date: new Date(transaction.created_at).toLocaleDateString()
      })) || [];

      setFinanceData({
        totalRevenue,
        totalPending,
        collectionRate,
        recentTransactions
      });

    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast({
        title: "Error",
        description: "Failed to load finance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  KES {financeData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Fees</p>
                <p className="text-2xl font-bold text-orange-700">
                  KES {financeData.totalPending.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-700">
                  {financeData.collectionRate.toFixed(1)}%
                </p>
              </div>
              <Badge variant={financeData.collectionRate > 80 ? "default" : "secondary"}>
                {financeData.collectionRate > 80 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h4 className="font-semibold mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {financeData.recentTransactions.length > 0 ? (
              financeData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.paymentMethod} • {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +KES {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>

        {/* Action Buttons - Only viewing/reporting, no expense addition */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalFinanceCard;
