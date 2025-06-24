
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useAuth } from '@/contexts/AuthContext';

const FinancialReportsModule: React.FC = () => {
  const [reportType, setReportType] = useState<'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions'>('school_financial');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { generateReport, downloadReport, loading } = useFinanceReports();
  const { user } = useAuth();

  const handleGenerateReport = async () => {
    const filters = {
      reportType,
      academicYear,
      term: term === 'all' ? undefined : term,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    const { data, error } = await generateReport(filters);
    
    if (data && !error) {
      const filename = `${reportType}_${academicYear}_${Date.now()}`;
      downloadReport(data, filename);
    }
  };

  const reportTypes = [
    { value: 'school_financial', label: 'School Financial Summary', icon: DollarSign },
    { value: 'fee_collection', label: 'Fee Collection Report', icon: Users },
    { value: 'expense_summary', label: 'Expense Summary', icon: TrendingUp },
    { value: 'mpesa_transactions', label: 'M-PESA Transactions', icon: FileText },
  ];

  const currentReportType = reportTypes.find(type => type.value === reportType);

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Financial Reports Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Academic Year</label>
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
              <label className="text-sm font-medium mb-2 block">Term</label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Date Range for certain reports */}
          {(reportType === 'mpesa_transactions' || reportType === 'expense_summary') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Preview/Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentReportType && <currentReportType.icon className="h-5 w-5" />}
            {currentReportType?.label} Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportType === 'school_financial' && (
              <div>
                <h3 className="font-semibold mb-2">School Financial Summary Report</h3>
                <p className="text-gray-600 mb-4">
                  This report provides a comprehensive overview of your school's financial status including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Total fees collected vs. outstanding amounts</li>
                  <li>Collection rate percentage</li>
                  <li>Monthly collection trends</li>
                  <li>Student payment status breakdown</li>
                </ul>
              </div>
            )}

            {reportType === 'fee_collection' && (
              <div>
                <h3 className="font-semibold mb-2">Fee Collection Report</h3>
                <p className="text-gray-600 mb-4">
                  Detailed breakdown of fee collections including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Student-wise fee collection details</li>
                  <li>Class-wise collection summaries</li>
                  <li>Payment method breakdown</li>
                  <li>Outstanding balance analysis</li>
                </ul>
              </div>
            )}

            {reportType === 'expense_summary' && (
              <div>
                <h3 className="font-semibold mb-2">Expense Summary Report</h3>
                <p className="text-gray-600 mb-4">
                  Complete expense tracking report featuring:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Category-wise expense breakdown</li>
                  <li>Monthly expense trends</li>
                  <li>Budget vs. actual spending analysis</li>
                  <li>Expense approval status</li>
                </ul>
              </div>
            )}

            {reportType === 'mpesa_transactions' && (
              <div>
                <h3 className="font-semibold mb-2">M-PESA Transactions Report</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive M-PESA payment analysis including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>All M-PESA transaction records</li>
                  <li>Success vs. failure rate analysis</li>
                  <li>Transaction amount summaries</li>
                  <li>Student payment tracking via M-PESA</li>
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Reports are generated in PDF format and include your school's branding and contact information. All financial data is current as of the report generation time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Period</p>
                <p className="text-lg font-semibold">
                  {academicYear} - {term === 'all' ? 'All Terms' : term.charAt(0).toUpperCase() + term.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Type</p>
                <p className="text-lg font-semibold">{currentReportType?.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">School</p>
                <p className="text-lg font-semibold">{user?.school_id ? 'Active' : 'Not Set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReportsModule;
