
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, BarChart3, Calendar } from 'lucide-react';
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

  // Mock grade and attendance data for summary view
  const gradeSummary = [
    { class: 'Grade 1A', average: 85, students: 32 },
    { class: 'Grade 1B', average: 82, students: 30 },
    { class: 'Grade 2A', average: 88, students: 28 },
    { class: 'Grade 2B', average: 79, students: 31 }
  ];

  const attendanceSummary = [
    { class: 'Grade 1A', rate: 94, present: 30, total: 32 },
    { class: 'Grade 1B', rate: 92, present: 28, total: 30 },
    { class: 'Grade 2A', rate: 96, present: 27, total: 28 },
    { class: 'Grade 2B', rate: 89, present: 28, total: 31 }
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
      action: () => toast({ title: "Invoice Generation", description: "Generating student invoices..." })
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
      action: () => toast({ title: "MPESA Reconciliation", description: "Reconciling mobile payments..." })
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

      {/* Academic Performance Summary */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Academic Performance Summary (Read-Only)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Finance Officer View</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Academic data shown for context only. Contact teachers for detailed grade information.
            </p>
          </div>
          <div className="space-y-3">
            {gradeSummary.map((classData, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{classData.class}</p>
                  <p className="text-sm text-muted-foreground">{classData.students} students</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{classData.average}%</p>
                  <p className="text-xs text-muted-foreground">Class Average</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Attendance Summary (Read-Only)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceSummary.map((classData, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{classData.class}</p>
                  <p className="text-sm text-muted-foreground">
                    {classData.present}/{classData.total} students present
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={classData.rate} className="h-2" />
                  </div>
                  <Badge variant={classData.rate >= 90 ? 'default' : 'secondary'}>
                    {classData.rate}%
                  </Badge>
                </div>
              </div>
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
    </div>
  );
};

export default FinanceOfficerDashboard;
