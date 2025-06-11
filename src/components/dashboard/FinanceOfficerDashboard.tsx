
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import StatsCard from './shared/StatsCard';
import QuickActionCard from './shared/QuickActionCard';

interface FinanceOfficerDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const FinanceOfficerDashboard = ({ onModalOpen }: FinanceOfficerDashboardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const financeStats = [
    {
      title: "Today's Collections",
      value: "KES 125,400",
      subtitle: "45 transactions",
      icon: "💰",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Pending Payments",
      value: "KES 89,200",
      subtitle: "23 outstanding",
      icon: "⏳",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "This Month",
      value: "KES 2.4M",
      subtitle: "95% collected",
      icon: "📊",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "MPESA Payments",
      value: "156",
      subtitle: "This week",
      icon: "📱",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const handleCollectFees = () => {
    setIsProcessing(true);
    toast({
      title: "Fee Collection",
      description: "Processing fee collection...",
    });
    setTimeout(() => {
      setIsProcessing(false);
      onModalOpen('fee-collection');
    }, 1500);
  };

  const handleGenerateInvoice = () => {
    toast({
      title: "Invoice Generation",
      description: "Generating student invoices...",
    });
  };

  const handleReconcilePayments = () => {
    toast({
      title: "Payment Reconciliation",
      description: "Reconciling MPESA payments...",
    });
  };

  const quickActions = [
    {
      title: "Collect Fees",
      description: "Record fee payments",
      icon: "💳",
      color: "from-green-500 to-green-600",
      action: handleCollectFees
    },
    {
      title: "Generate Invoices",
      description: "Create student invoices",
      icon: "📄",
      color: "from-blue-500 to-blue-600",
      action: handleGenerateInvoice
    },
    {
      title: "Payment Reports",
      description: "View financial reports",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      action: () => onModalOpen('financial-reports')
    },
    {
      title: "MPESA Reconciliation",
      description: "Reconcile mobile payments",
      icon: "📱",
      color: "from-orange-500 to-orange-600",
      action: handleReconcilePayments
    }
  ];

  const recentTransactions = [
    { student: "John Doe", amount: "KES 15,000", type: "Term Fee", method: "MPESA", time: "10 min ago" },
    { student: "Jane Smith", amount: "KES 8,500", type: "Lunch Fee", method: "Bank", time: "25 min ago" },
    { student: "Bob Johnson", amount: "KES 12,000", type: "Transport Fee", method: "Cash", time: "1 hour ago" },
    { student: "Alice Brown", amount: "KES 20,000", type: "Full Term", method: "MPESA", time: "2 hours ago" },
  ];

  const defaulters = [
    { student: "Mike Wilson", class: "Grade 5A", amount: "KES 25,000", days: 15 },
    { student: "Sarah Davis", class: "Grade 3B", amount: "KES 18,000", days: 8 },
    { student: "Tom Miller", class: "Grade 7A", amount: "KES 32,000", days: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* Finance Stats */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💰</span>
            <span>Financial Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {financeStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={action.action}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💳</span>
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all duration-200">
                <div>
                  <p className="font-medium">{transaction.student}</p>
                  <p className="text-sm text-muted-foreground">{transaction.type} • {transaction.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{transaction.amount}</p>
                  <p className="text-xs text-muted-foreground">{transaction.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Defaulters Alert */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>Fee Defaulters Alert</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {defaulters.map((defaulter, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium">{defaulter.student}</p>
                  <p className="text-sm text-muted-foreground">{defaulter.class}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{defaulter.amount}</p>
                  <Badge variant="destructive" className="text-xs">
                    {defaulter.days} days overdue
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Reports */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Generate Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onModalOpen('financial-reports')}
              disabled={isProcessing}
            >
              <span className="text-xl">📈</span>
              Fee Collection Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "Defaulters Report",
                  description: "Generating fee defaulters report...",
                });
              }}
              disabled={isProcessing}
            >
              <span className="text-xl">⚠️</span>
              Defaulters Report
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                toast({
                  title: "Financial Summary",
                  description: "Generating monthly financial summary...",
                });
              }}
              disabled={isProcessing}
            >
              <span className="text-xl">💰</span>
              Monthly Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceOfficerDashboard;
