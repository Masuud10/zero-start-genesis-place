import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

interface BillingStats {
  totalBilledSchools: number;
  totalSetupRevenue: number;
  totalSubscriptionRevenue: number;
  outstandingBalances: number;
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  setupFees: number;
  totalInvoices: number;
  averageSetupFee: number;
  averageSubscriptionFee: number;
  collectionRate: number;
}

interface EnhancedBillingStatsCardsProps {
  stats: BillingStats;
}

const EnhancedBillingStatsCards: React.FC<EnhancedBillingStatsCardsProps> = ({
  stats,
}) => {
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return "text-green-600";
    if (value >= threshold * 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Billed Schools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Billed Schools
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBilledSchools}</div>
          <p className="text-xs text-muted-foreground">
            Schools with billing records
          </p>
        </CardContent>
      </Card>

      {/* Total Setup Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Setup Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalSetupRevenue)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">One-time fees</p>
            <Badge variant="outline" className="text-xs">
              {stats.setupFees} records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Subscription Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Subscription Revenue
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalSubscriptionRevenue)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">Recurring fees</p>
            <Badge variant="outline" className="text-xs">
              {stats.totalInvoices - stats.setupFees} records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Balances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Outstanding Balances
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getStatusColor(
              stats.outstandingBalances,
              stats.totalRevenue
            )}`}
          >
            {formatCurrency(stats.outstandingBalances)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">Pending payments</p>
            <Badge variant="outline" className="text-xs">
              {stats.pendingInvoices} invoices
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">All time</p>
            <Badge variant="outline" className="text-xs">
              {stats.totalInvoices} invoices
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${getStatusColor(
              stats.collectionRate,
              80
            )}`}
          >
            {formatPercentage(stats.collectionRate)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">Success rate</p>
            <Badge variant="outline" className="text-xs">
              {stats.paidInvoices}/{stats.totalInvoices}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Average Setup Fee */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Setup Fee</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.averageSetupFee)}
          </div>
          <p className="text-xs text-muted-foreground">Per school</p>
        </CardContent>
      </Card>

      {/* Average Subscription Fee */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Subscription
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.averageSubscriptionFee)}
          </div>
          <p className="text-xs text-muted-foreground">Per billing cycle</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBillingStatsCards;
