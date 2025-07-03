import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ReportService } from '@/services/reportService';
import { FinanceReportFilters } from '@/types/report';
import ReportHeader from './shared/ReportHeader';
import ReportFooter from './shared/ReportFooter';
import ExportButton from './shared/ExportButton';
import { useToast } from '@/hooks/use-toast';

const FinanceReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FinanceReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'fee_collection'
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    if (!user?.school_id) return;
    
    setLoading(true);
    try {
      let report;
      
      switch (filters.reportType) {
        case 'fee_collection':
          report = await ReportService.generateFeeCollectionReport(user.school_id, filters.startDate, filters.endDate);
          break;
        default:
          // For other report types, use a generic approach
          report = {
            id: `${filters.reportType}-${Date.now()}`,
            title: `${filters.reportType.replace('_', ' ').toUpperCase()} Report`,
            generatedAt: new Date().toISOString(),
            schoolInfo: { name: 'Financial Report' },
            content: { message: `${filters.reportType} report data would be displayed here` }
          };
      }
      
      setReportData(report);
      toast({
        title: "Report Generated",
        description: "Your financial report has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Finance report data would be formatted as CSV here";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Finance Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee_collection">Fee Collection Reports</SelectItem>
                  <SelectItem value="mpesa_transactions">MPESA Transactions</SelectItem>
                  <SelectItem value="outstanding">Outstanding Balances</SelectItem>
                  <SelectItem value="subscription">Subscription Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              onClick={handleGenerateReport} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <span>{loading ? 'Generating...' : 'Generate Report'}</span>
            </Button>

            {reportData && (
              <ExportButton
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                loading={loading}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card className="print:shadow-none">
          <CardContent className="p-6">
            <ReportHeader
              schoolInfo={reportData.schoolInfo}
              title={reportData.title}
              generatedAt={reportData.generatedAt}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Financial Summary</h3>
              
              {reportData.content?.transactions?.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">Total Collection</h4>
                      <p className="text-2xl font-bold text-green-600">
                        KES {reportData.content.transactions.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Transactions</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.content.transactions.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Period</h4>
                      <p className="text-sm font-medium text-purple-600">
                        {filters.startDate} to {filters.endDate}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Currency</h4>
                      <p className="text-lg font-bold text-orange-600">KES</p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">Transaction Details</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Date</th>
                          <th className="border border-border p-2 text-left">Student</th>
                          <th className="border border-border p-2 text-left">Amount (KES)</th>
                          <th className="border border-border p-2 text-left">Type</th>
                          <th className="border border-border p-2 text-left">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.content.transactions.map((transaction: any, index: number) => (
                          <tr key={index}>
                            <td className="border border-border p-2">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </td>
                            <td className="border border-border p-2">{transaction.student?.name || 'N/A'}</td>
                            <td className="border border-border p-2 font-mono">
                              {Number(transaction.amount).toLocaleString()}
                            </td>
                            <td className="border border-border p-2">{transaction.transaction_type}</td>
                            <td className="border border-border p-2">{transaction.payment_method || 'Cash'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {reportData.content?.message || 'No financial data available for the selected period.'}
                </p>
              )}
            </div>

            <ReportFooter />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinanceReportsModule;