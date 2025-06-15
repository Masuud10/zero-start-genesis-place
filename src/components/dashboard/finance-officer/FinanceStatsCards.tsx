
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinanceStatsCardsProps {
  loading: boolean;
  stats: {
    monthlyRevenue: number;
    outstandingFees: number;
    paymentRate: number;
    mpesaTransactions: number;
  };
}

const FinanceStatsCards: React.FC<FinanceStatsCardsProps> = ({ loading, stats }) => (
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
);

export default FinanceStatsCards;

