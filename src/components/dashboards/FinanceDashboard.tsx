import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PieChart,
  FileText,
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const FinanceDashboard = () => {
  // Mock data for demonstration
  const financialMetrics = {
    totalRevenue: '$328,450',
    totalExpenses: '$142,890',
    netProfit: '$185,560',
    cashFlow: '+$42,120'
  };

  const recentTransactions = [
    { id: 1, description: 'Software Licenses', amount: '-$12,000', date: '2 hours ago', status: 'completed' },
    { id: 2, description: 'Client Payment - Acme Corp', amount: '+$25,000', date: '5 hours ago', status: 'completed' },
    { id: 3, description: 'Office Rent', amount: '-$8,500', date: '1 day ago', status: 'pending' },
  ];

  const upcomingPayments = [
    { id: 1, vendor: 'Cloud Services', amount: '$3,200', dueDate: 'Tomorrow', priority: 'high' },
    { id: 2, vendor: 'Marketing Agency', amount: '$7,500', dueDate: 'Dec 20', priority: 'medium' },
    { id: 3, vendor: 'Legal Services', amount: '$2,100', dueDate: 'Dec 25', priority: 'low' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Monitor financial performance and manage payments</p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{financialMetrics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{financialMetrics.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">-5.4% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{financialMetrics.netProfit}</div>
            <p className="text-xs text-muted-foreground">+24.8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{financialMetrics.cashFlow}</div>
            <p className="text-xs text-muted-foreground">Positive this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {transaction.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount}
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-4 w-4 ${
                    payment.priority === 'high' ? 'text-red-600' :
                    payment.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div>
                    <p className="font-medium">{payment.vendor}</p>
                    <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{payment.amount}</p>
                  <Badge variant={
                    payment.priority === 'high' ? 'destructive' :
                    payment.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {payment.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Invoices</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calculator className="h-6 w-6" />
              <span>Expenses</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <PieChart className="h-6 w-6" />
              <span>Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;