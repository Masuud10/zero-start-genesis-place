
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Filter, DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { useToast } from '@/hooks/use-toast';

const FinancialReportsModule: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [selectedReportType, setSelectedReportType] = useState('fee_collection');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useFinanceOfficerAnalytics({
    term: selectedTerm,
    class: 'all'
  });
  
  const { transactions: mpesaTransactions, loading: mpesaLoading } = useMpesaTransactions();
  const { toast } = useToast();

  const loading = analyticsLoading || mpesaLoading;
  const error = analyticsError;

  // Generate report data based on selected type
  const generateReportData = () => {
    if (!analyticsData) return null;

    switch (selectedReportType) {
      case 'fee_collection':
        return {
          title: 'Fee Collection Report',
          summary: {
            totalCollected: analyticsData.keyMetrics.totalCollected,
            outstanding: analyticsData.keyMetrics.outstandingAmount,
            collectionRate: analyticsData.keyMetrics.collectionRate,
            mpesaPayments: analyticsData.keyMetrics.totalMpesaPayments
          },
          details: analyticsData.feeCollectionData.map(item => ({
            class: item.class,
            expected: item.expected,
            collected: item.collected,
            outstanding: item.expected - item.collected,
            rate: item.expected > 0 ? ((item.collected / item.expected) * 100).toFixed(1) : '0'
          }))
        };

      case 'mpesa_summary':
        const successfulMpesa = mpesaTransactions.filter(t => t.transaction_status === 'Success');
        const pendingMpesa = mpesaTransactions.filter(t => t.transaction_status === 'Pending');
        const failedMpesa = mpesaTransactions.filter(t => t.transaction_status === 'Failed');
        
        return {
          title: 'M-PESA Payments Summary',
          summary: {
            totalTransactions: mpesaTransactions.length,
            successful: successfulMpesa.length,
            pending: pendingMpesa.length,
            failed: failedMpesa.length,
            totalAmount: successfulMpesa.reduce((sum, t) => sum + (t.amount_paid || 0), 0)
          },
          details: mpesaTransactions.slice(0, 20).map(transaction => ({
            date: new Date(transaction.transaction_date).toLocaleDateString(),
            phone: transaction.phone_number,
            amount: transaction.amount_paid || 0,
            receipt: transaction.mpesa_receipt_number || 'N/A',
            status: transaction.transaction_status,
            student: transaction.student?.name || 'Direct Payment'
          }))
        };

      case 'outstanding_balances':
        return {
          title: 'Outstanding Balances Report',
          summary: {
            totalOutstanding: analyticsData.keyMetrics.outstandingAmount,
            defaultersCount: analyticsData.keyMetrics.defaultersCount,
            averageOutstanding: analyticsData.keyMetrics.defaultersCount > 0 
              ? (analyticsData.keyMetrics.outstandingAmount / analyticsData.keyMetrics.defaultersCount).toFixed(0)
              : 0
          },
          details: analyticsData.defaultersList.map(defaulter => ({
            student: defaulter.student_name,
            admission: defaulter.admission_number,
            class: defaulter.class_name,
            amount: defaulter.outstanding_amount,
            daysOverdue: defaulter.days_overdue
          }))
        };

      default:
        return null;
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reportData = generateReportData();
      if (reportData) {
        toast({
          title: "Report Generated",
          description: `${reportData.title} has been generated successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = () => {
    const reportData = generateReportData();
    if (!reportData) return;

    // Create CSV content
    let csvContent = `${reportData.title}\n\n`;
    
    // Add summary
    csvContent += "Summary:\n";
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });
    
    csvContent += "\nDetails:\n";
    
    // Add headers and data
    if (reportData.details.length > 0) {
      const headers = Object.keys(reportData.details[0]);
      csvContent += headers.join(',') + '\n';
      
      reportData.details.forEach(row => {
        csvContent += Object.values(row).join(',') + '\n';
      });
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Report has been downloaded as CSV file.",
    });
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading financial data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Generate and download comprehensive financial reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee_collection">Fee Collection Report</SelectItem>
                  <SelectItem value="mpesa_summary">M-PESA Payments Summary</SelectItem>
                  <SelectItem value="outstanding_balances">Outstanding Balances</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Term</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportReport}
                disabled={!reportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {reportData.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-lg font-bold">
                    {typeof value === 'number' && key.toLowerCase().includes('amount') 
                      ? formatCurrency(value)
                      : typeof value === 'number' && key.toLowerCase().includes('rate')
                      ? `${value.toFixed(1)}%`
                      : value
                    }
                  </p>
                </div>
              ))}
            </div>

            {/* Report Details Table */}
            <div className="overflow-x-auto">
              {selectedReportType === 'fee_collection' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Collection Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.details.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.class}</TableCell>
                        <TableCell>{formatCurrency(row.expected)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(row.collected)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(row.outstanding)}</TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(row.rate) >= 80 ? 'default' : 'destructive'}>
                            {row.rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {selectedReportType === 'mpesa_summary' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.details.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-mono text-sm">{row.phone}</TableCell>
                        <TableCell>{formatCurrency(row.amount)}</TableCell>
                        <TableCell className="font-mono text-xs">{row.receipt}</TableCell>
                        <TableCell>{row.student}</TableCell>
                        <TableCell>
                          <Badge variant={
                            row.status === 'Success' ? 'default' : 
                            row.status === 'Pending' ? 'secondary' : 'destructive'
                          }>
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {selectedReportType === 'outstanding_balances' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Outstanding Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.details.map((row: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.student}</TableCell>
                        <TableCell>{row.admission}</TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {formatCurrency(row.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.daysOverdue > 30 ? 'destructive' : 'secondary'}>
                            {row.daysOverdue} days
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReportsModule;
