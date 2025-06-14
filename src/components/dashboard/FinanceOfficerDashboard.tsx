
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { DollarSign, Users, CreditCard, BarChart3, FileText } from 'lucide-react';

interface FinanceOfficerDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({ user, onModalOpen }) => {
  console.log('💰 FinanceOfficerDashboard: Rendering for finance officer:', user.email);

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
            <div className="text-2xl font-bold text-green-600">KES 250K</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES 45K</div>
            <p className="text-xs text-muted-foreground">18% of total fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87.5%</div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
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
