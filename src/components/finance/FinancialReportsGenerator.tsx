
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FinancialReportsGenerator: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [term, setTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('2024');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['financial-reports', user?.school_id, reportType, dateRange, startDate, endDate, term, academicYear],
    queryFn: async () => {
      if (!user?.school_id || !reportType) return null;

      const reports: any = {};

      // Fee Collection Report
      if (reportType === 'fee_collection' || reportType === 'comprehensive') {
        const { data: fees, error: feesError } = await supabase
          .from('fees')
          .select(`
            *,
            students!fees_student_id_fkey(name, admission_number),
            classes!fees_class_id_fkey(name)
          `)
          .eq('school_id', user.school_id)
          .eq('academic_year', academicYear)
          .eq('term', term || 'Term 1');

        if (feesError) throw feesError;
        reports.fees = fees;
      }

      // MPESA Transactions Report
      if (reportType === 'mpesa_transactions' || reportType === 'comprehensive') {
        let mpesaQuery = supabase
          .from('mpesa_transactions')
          .select(`
            *,
            students!mpesa_transactions_student_id_fkey(name, admission_number)
          `)
          .eq('school_id', user.school_id);

        if (startDate && endDate) {
          mpesaQuery = mpesaQuery
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate);
        }

        const { data: mpesaTransactions, error: mpesaError } = await mpesaQuery;
        if (mpesaError) throw mpesaError;
        reports.mpesaTransactions = mpesaTransactions;
      }

      // Expenses Report
      if (reportType === 'expenses' || reportType === 'comprehensive') {
        let expensesQuery = supabase
          .from('expenses')
          .select('*')
          .eq('school_id', user.school_id);

        if (startDate && endDate) {
          expensesQuery = expensesQuery
            .gte('date', startDate)
            .lte('date', endDate);
        }

        const { data: expenses, error: expensesError } = await expensesQuery;
        if (expensesError) throw expensesError;
        reports.expenses = expenses;
      }

      // Outstanding Balances Report
      if (reportType === 'outstanding_balances' || reportType === 'comprehensive') {
        const { data: outstandingFees, error: outstandingError } = await supabase
          .from('fees')
          .select(`
            *,
            students!fees_student_id_fkey(name, admission_number),
            classes!fees_class_id_fkey(name)
          `)
          .eq('school_id', user.school_id)
          .neq('status', 'paid');

        if (outstandingError) throw outstandingError;
        reports.outstandingFees = outstandingFees;
      }

      return reports;
    },
    enabled: !!user?.school_id && !!reportType
  });

  const generatePDFReport = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.replace('_', ' ').toUpperCase()}`, 20, 35);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 45);
    doc.text(`Period: ${startDate || 'All time'} - ${endDate || 'Present'}`, 20, 55);

    let yPosition = 70;

    // Fee Collection Summary
    if (reportData.fees) {
      doc.setFontSize(16);
      doc.text('Fee Collection Summary', 20, yPosition);
      yPosition += 15;

      const totalFees = reportData.fees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
      const totalCollected = reportData.fees.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0);
      const outstanding = totalFees - totalCollected;

      doc.setFontSize(12);
      doc.text(`Total Expected: KES ${totalFees.toLocaleString()}`, 20, yPosition);
      doc.text(`Total Collected: KES ${totalCollected.toLocaleString()}`, 20, yPosition + 10);
      doc.text(`Outstanding: KES ${outstanding.toLocaleString()}`, 20, yPosition + 20);
      
      yPosition += 40;

      // Fee details table
      const feeTableData = reportData.fees.map((fee: any) => [
        fee.students?.name || 'N/A',
        fee.students?.admission_number || 'N/A',
        fee.classes?.name || 'N/A',
        fee.category,
        `KES ${fee.amount.toLocaleString()}`,
        `KES ${(fee.paid_amount || 0).toLocaleString()}`,
        fee.status
      ]);

      (doc as any).autoTable({
        head: [['Student', 'Admission No.', 'Class', 'Category', 'Amount', 'Paid', 'Status']],
        body: feeTableData,
        startY: yPosition,
        styles: { fontSize: 8 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // MPESA Transactions
    if (reportData.mpesaTransactions) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text('M-PESA Transactions', 20, yPosition);
      yPosition += 15;

      const successfulTxns = reportData.mpesaTransactions.filter((tx: any) => tx.transaction_status === 'Success');
      const totalMpesaAmount = successfulTxns.reduce((sum: number, tx: any) => sum + tx.amount_paid, 0);

      doc.setFontSize(12);
      doc.text(`Total Transactions: ${reportData.mpesaTransactions.length}`, 20, yPosition);
      doc.text(`Successful: ${successfulTxns.length}`, 20, yPosition + 10);
      doc.text(`Total Amount: KES ${totalMpesaAmount.toLocaleString()}`, 20, yPosition + 20);
      
      yPosition += 40;

      const mpesaTableData = reportData.mpesaTransactions.slice(0, 20).map((tx: any) => [
        format(new Date(tx.transaction_date), 'MMM dd, yyyy'),
        tx.students?.name || 'N/A',
        tx.phone_number,
        `KES ${tx.amount_paid.toLocaleString()}`,
        tx.transaction_status,
        tx.mpesa_receipt_number || 'N/A'
      ]);

      (doc as any).autoTable({
        head: [['Date', 'Student', 'Phone', 'Amount', 'Status', 'M-PESA Code']],
        body: mpesaTableData,
        startY: yPosition,
        styles: { fontSize: 8 }
      });
    }

    // Save PDF
    doc.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "Report Generated",
      description: "Financial report has been downloaded",
    });
  };

  const generateExcelReport = () => {
    if (!reportData) return;

    let csvContent = '';
    
    if (reportData.fees) {
      csvContent += 'Fee Collection Report\n';
      csvContent += 'Student,Admission Number,Class,Category,Amount,Paid Amount,Status,Due Date\n';
      
      reportData.fees.forEach((fee: any) => {
        csvContent += `"${fee.students?.name || 'N/A'}","${fee.students?.admission_number || 'N/A'}","${fee.classes?.name || 'N/A'}","${fee.category}","${fee.amount}","${fee.paid_amount || 0}","${fee.status}","${fee.due_date}"\n`;
      });
      
      csvContent += '\n\n';
    }

    if (reportData.mpesaTransactions) {
      csvContent += 'M-PESA Transactions Report\n';
      csvContent += 'Date,Student,Phone,Amount,Status,M-PESA Code,Transaction ID\n';
      
      reportData.mpesaTransactions.forEach((tx: any) => {
        csvContent += `"${format(new Date(tx.transaction_date), 'yyyy-MM-dd HH:mm')}","${tx.students?.name || 'N/A'}","${tx.phone_number}","${tx.amount_paid}","${tx.transaction_status}","${tx.mpesa_receipt_number || 'N/A'}","${tx.transaction_id}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Financial report has been exported to CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Financial Reports
          </h2>
          <p className="text-muted-foreground">Generate comprehensive financial reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee_collection">Fee Collection</SelectItem>
                  <SelectItem value="mpesa_transactions">M-PESA Transactions</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="outstanding_balances">Outstanding Balances</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generatePDFReport} 
              disabled={!reportData || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={generateExcelReport} 
              disabled={!reportData || isLoading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportData.fees && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Collected</p>
                    <p className="text-2xl font-bold text-green-700">
                      KES {reportData.fees.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.mpesaTransactions && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">M-PESA Transactions</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {reportData.mpesaTransactions.length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.outstandingFees && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-700">
                      KES {reportData.outstandingFees.reduce((sum: number, fee: any) => sum + (fee.amount - (fee.paid_amount || 0)), 0).toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialReportsGenerator;
