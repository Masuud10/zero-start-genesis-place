
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Filter, Loader2, BarChart3 } from 'lucide-react';
import { useFinancialReports, ReportType, ReportFilter } from '@/hooks/finance/useFinancialReports';
import { useToast } from '@/hooks/use-toast';

const FinancialReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [dateRange, setDateRange] = useState<'current_term' | 'current_year' | 'last_month' | 'last_quarter' | 'custom'>('current_term');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [lastGeneratedReport, setLastGeneratedReport] = useState<any>(null);

  const { generateReport, downloadReport, isGenerating, error } = useFinancialReports();
  const { toast } = useToast();

  const reportTypes = [
    { value: 'fee_statements' as const, label: 'Fee Statements', description: 'Individual student fee statements' },
    { value: 'payment_summaries' as const, label: 'Payment Summaries', description: 'Payment collection summaries' },
    { value: 'outstanding_balances' as const, label: 'Outstanding Balances', description: 'Students with pending fees' },
    { value: 'collection_analysis' as const, label: 'Collection Analysis', description: 'Fee collection performance' },
    { value: 'expense_reports' as const, label: 'Expense Reports', description: 'School expenditure analysis' },
    { value: 'financial_summary' as const, label: 'Financial Summary', description: 'Comprehensive financial overview' },
    { value: 'monthly_revenue' as const, label: 'Monthly Revenue', description: 'Monthly revenue breakdown' },
    { value: 'mpesa_transactions' as const, label: 'MPESA Transactions', description: 'Mobile money payment history' }
  ];

  const handleGenerateReport = async (type: ReportType) => {
    if (!type) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    const filters: ReportFilter = {
      dateRange,
      startDate: dateRange === 'custom' ? startDate : undefined,
      endDate: dateRange === 'custom' ? endDate : undefined,
      classId: classId || undefined
    };

    const reportData = await generateReport(type, filters);
    if (reportData) {
      setLastGeneratedReport(reportData);
    }
  };

  const handleDownloadReport = (format: 'csv' | 'pdf' = 'csv') => {
    if (!lastGeneratedReport) {
      toast({
        title: "Error",
        description: "No report to download. Please generate a report first.",
        variant: "destructive",
      });
      return;
    }
    downloadReport(lastGeneratedReport, format);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Financial Reports
          </h2>
          <p className="text-muted-foreground">Generate and download financial reports</p>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_term">Current Term</SelectItem>
                  <SelectItem value="current_year">Current Academic Year</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Class Filter (Optional)</label>
              <Input
                placeholder="Enter Class ID"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              />
            </div>
            
            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {lastGeneratedReport && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">{lastGeneratedReport.title}</p>
                  <p className="text-sm text-green-600">{lastGeneratedReport.summary.totalRecords} records generated</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    TXT
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.value} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{report.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Format: PDF, Excel
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport(report.value)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Report Preview */}
      {lastGeneratedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generated Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{lastGeneratedReport.summary.totalRecords}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                {lastGeneratedReport.summary.totalAmount && (
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      KES {lastGeneratedReport.summary.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                )}
                {lastGeneratedReport.summary.averageAmount && (
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      KES {lastGeneratedReport.summary.averageAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Amount</div>
                  </div>
                )}
              </div>
              
              {lastGeneratedReport.data.length > 0 && (
                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <h4 className="font-medium">Sample Data (First 5 rows)</h4>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(lastGeneratedReport.data[0]).slice(0, 5).map(key => (
                              <th key={key} className="text-left p-2 font-medium">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lastGeneratedReport.data.slice(0, 5).map((row: any, index: number) => (
                            <tr key={index} className="border-b">
                              {Object.values(row).slice(0, 5).map((value: any, i: number) => (
                                <td key={i} className="p-2">{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Monthly Fee Collection Report', date: '2024-01-15', type: 'Collection Analysis', size: '2.3 MB' },
              { name: 'Outstanding Balances Report', date: '2024-01-14', type: 'Outstanding Balances', size: '1.8 MB' },
              { name: 'Term 1 Financial Summary', date: '2024-01-10', type: 'Financial Summary', size: '3.1 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.type} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{report.date}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsPanel;
