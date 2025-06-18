
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinanceData {
  totalRevenue: number;
  totalPending: number;
  collectionRate: number;
}

const FinancialOverviewReadOnly = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalRevenue: 0,
    totalPending: 0,
    collectionRate: 0,
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
      const [revenueRes, pendingRes] = await Promise.all([
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
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const totalPending = pendingRes.data?.reduce((sum, fee) => sum + ((fee.amount || 0) - (fee.paid_amount || 0)), 0) || 0;
      const collectionRate = totalRevenue + totalPending > 0 ? (totalRevenue / (totalRevenue + totalPending)) * 100 : 0;

      setFinanceData({
        totalRevenue,
        totalPending,
        collectionRate,
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
      <Card className="border border-gray-200">
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
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Overview
        </CardTitle>
        <p className="text-gray-600 text-sm">Fee collection summary</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">
                  KES {financeData.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pending Fees</p>
                <p className="text-lg font-bold text-orange-600">
                  KES {financeData.totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Collection Rate</p>
                <p className="text-lg font-bold text-blue-600">
                  {financeData.collectionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverviewReadOnly;
