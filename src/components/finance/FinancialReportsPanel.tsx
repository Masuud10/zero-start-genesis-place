
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const FinancialReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('current_term');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const reportTypes = [
    { value: 'fee_statements', label: 'Fee Statements', description: 'Individual student fee statements' },
    { value: 'payment_summaries', label: 'Payment Summaries', description: 'Payment collection summaries' },
    { value: 'outstanding_balances', label: 'Outstanding Balances', description: 'Students with pending fees' },
    { value: 'collection_analysis', label: 'Collection Analysis', description: 'Fee collection performance' },
    { value: 'expense_reports', label: 'Expense Reports', description: 'School expenditure analysis' },
    { value: 'financial_summary', label: 'Financial Summary', description: 'Comprehensive financial overview' }
  ];

  const handleGenerateReport = (type: string) => {
    console.log('Generating report:', type);
    // Here you would implement the actual report generation logic
    // For now, we'll simulate the process
    alert(`Generating ${type} report...`);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
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
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Report Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-muted-foreground">Reports Generated This Month</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-muted-foreground">Fee Collection Rate</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">23</div>
              <div className="text-sm text-muted-foreground">Outstanding Accounts</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Automated Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
