
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useStudentFees } from '@/hooks/useFees';
import { useExpenses } from '@/hooks/useExpenses';
import { useAcademicTerms } from '@/hooks/useAcademicTerms';
import { format } from 'date-fns';

const FinanceReportsPanel: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedTerm, setSelectedTerm] = useState('');

  const { studentFees } = useStudentFees();
  const { expenses } = useExpenses();
  const { academicTerms } = useAcademicTerms();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  // Calculate income summary
  const totalIncome = studentFees
    .filter(sf => sf.status === 'paid')
    .reduce((sum, sf) => sum + sf.amount_paid, 0);

  const partialIncome = studentFees
    .filter(sf => sf.status === 'partial')
    .reduce((sum, sf) => sum + sf.amount_paid, 0);

  const outstandingFees = studentFees
    .filter(sf => sf.status === 'unpaid')
    .reduce((sum, sf) => sum + ((sf.fee?.amount || 0) - sf.amount_paid), 0);

  // Calculate expense summary
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Net balance
  const netBalance = totalIncome + partialIncome - totalExpenses;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group fees by category
  const feesByCategory = studentFees.reduce((acc, studentFee) => {
    const category = studentFee.fee?.category || 'General';
    if (!acc[category]) {
      acc[category] = { total: 0, paid: 0, unpaid: 0 };
    }
    const feeAmount = studentFee.fee?.amount || 0;
    acc[category].total += feeAmount;
    if (studentFee.status === 'paid') {
      acc[category].paid += studentFee.amount_paid;
    } else {
      acc[category].unpaid += feeAmount - studentFee.amount_paid;
    }
    return acc;
  }, {} as Record<string, { total: number; paid: number; unpaid: number }>);

  const exportReport = (type: string) => {
    // This would typically generate and download a PDF/Excel file
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('income')}>
            <Download className="h-4 w-4 mr-2" />
            Export Income
          </Button>
          <Button variant="outline" onClick={() => exportReport('expenses')}>
            <Download className="h-4 w-4 mr-2" />
            Export Expenses
          </Button>
          <Button variant="outline" onClick={() => exportReport('complete')}>
            <Download className="h-4 w-4 mr-2" />
            Export Complete Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="term">Academic Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.term_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome + partialIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(outstandingFees)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">Income Reports</TabsTrigger>
          <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
          <TabsTrigger value="summary">Net Balance Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown by Fee Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Category</TableHead>
                    <TableHead>Total Expected</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Collection Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(feesByCategory).map(([category, data]) => {
                    const collectionRate = data.total > 0 ? (data.paid / data.total * 100) : 0;
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell>{formatCurrency(data.total)}</TableCell>
                        <TableCell>{formatCurrency(data.paid)}</TableCell>
                        <TableCell>{formatCurrency(data.unpaid)}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${collectionRate >= 80 ? 'text-green-600' : collectionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {collectionRate.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Percentage of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(expensesByCategory).map(([category, amount]) => {
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell>{formatCurrency(amount)}</TableCell>
                        <TableCell>{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Revenue (Fees Collected)</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalIncome + partialIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="font-bold text-lg">Net Profit/Loss</span>
                  <span className={`font-bold text-xl ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <span className="font-medium">Pending Collections</span>
                  <span className="font-bold text-orange-600">{formatCurrency(outstandingFees)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceReportsPanel;
