
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialReportsModalProps {
  onClose: () => void;
}

const FinancialReportsModal = ({ onClose }: FinancialReportsModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [reportType, setReportType] = useState('summary');

  const financialSummary = {
    totalExpected: 2500000,
    totalCollected: 1850000,
    collectionRate: 74,
    outstanding: 650000,
    expenses: 320000,
    netIncome: 1530000
  };

  const expenseCategories = [
    { category: 'Salaries', amount: 180000, percentage: 56.25 },
    { category: 'Utilities', amount: 45000, percentage: 14.06 },
    { category: 'Supplies', amount: 35000, percentage: 10.94 },
    { category: 'Maintenance', amount: 30000, percentage: 9.38 },
    { category: 'Transport', amount: 20000, percentage: 6.25 },
    { category: 'Other', amount: 10000, percentage: 3.13 },
  ];

  const classWiseCollection = [
    { class: 'Grade 1A', expected: 625000, collected: 525000, rate: 84 },
    { class: 'Grade 1B', expected: 700000, collected: 490000, rate: 70 },
    { class: 'Grade 2A', expected: 550000, collected: 440000, rate: 80 },
    { class: 'Grade 2B', expected: 625000, collected: 395000, rate: 63 },
  ];

  const handleGenerateReport = () => {
    console.log('Generating financial report:', { period: selectedPeriod, type: reportType });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Financial Reports & Analytics</DialogTitle>
          <DialogDescription>
            Generate comprehensive financial reports and track school revenue performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-term">Current Term</SelectItem>
                  <SelectItem value="last-term">Last Term</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Financial Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="comparison">Period Comparison</SelectItem>
                  <SelectItem value="projections">Financial Projections</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="collection">Collection</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Expected</p>
                      <p className="text-2xl font-bold text-blue-600">
                        KES {financialSummary.totalExpected.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Collected</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {financialSummary.totalCollected.toLocaleString()}
                      </p>
                      <Badge className="bg-green-100 text-green-800 mt-1">
                        {financialSummary.collectionRate}% rate
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold text-red-600">
                        KES {financialSummary.outstanding.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Income vs Expenses */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        KES {financialSummary.totalCollected.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        KES {financialSummary.expenses.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                      <p className="text-xl font-bold text-blue-600">
                        KES {financialSummary.netIncome.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collection" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Class-wise Fee Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classWiseCollection.map((item, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.class}</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Expected</p>
                              <p className="font-medium">KES {item.expected.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Collected</p>
                              <p className="font-medium text-green-600">KES {item.collected.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Rate</p>
                              <Badge 
                                className={
                                  item.rate >= 80 ? "bg-green-100 text-green-800" :
                                  item.rate >= 60 ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }
                              >
                                {item.rate}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expenseCategories.map((expense, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{expense.category}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-medium">KES {expense.amount.toLocaleString()}</p>
                            </div>
                            <Badge variant="outline">
                              {expense.percentage}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projections" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Financial Projections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Projected Revenue (Next Term)</p>
                        <p className="text-xl font-bold text-green-600">KES 2,800,000</p>
                        <Badge className="bg-green-100 text-green-800 mt-2">+12% growth</Badge>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Projected Expenses (Next Term)</p>
                        <p className="text-xl font-bold text-red-600">KES 350,000</p>
                        <Badge variant="secondary" className="mt-2">+9% increase</Badge>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 border border-border rounded-lg bg-blue-50">
                      <p className="text-sm text-muted-foreground">Projected Net Income (Next Term)</p>
                      <p className="text-2xl font-bold text-blue-600">KES 2,450,000</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on current trends and enrollment projections
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedPeriod}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Export Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialReportsModal;
