
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';

interface FinanceStats {
  monthlyRevenue: number;
  outstandingFees: number;
  paymentRate: number;
  mpesaTransactions: number;
}

interface FinanceStatsCardsProps {
  loading: boolean;
  stats: FinanceStats;
}

const FinanceStatsCards: React.FC<FinanceStatsCardsProps> = ({ loading, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? <span className="animate-pulse">...</span> : `KES ${stats.monthlyRevenue.toLocaleString()}`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Current month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Outstanding Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {loading ? <span className="animate-pulse">...</span> : `KES ${stats.outstandingFees.toLocaleString()}`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Pending collection"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Payment Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? <span className="animate-pulse">...</span> : `${stats.paymentRate.toFixed(1)}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Collection efficiency"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            MPESA Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {loading ? <span className="animate-pulse">...</span> : stats.mpesaTransactions}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : "Digital payments"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceStatsCards;
