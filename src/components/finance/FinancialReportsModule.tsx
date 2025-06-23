
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, TrendingUp, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FinancialReportsModule: React.FC = () => {
  const { generateReport, downloadReport, loading } = useFinanceReports();
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    { value: 'school_financial', label: 'School Financial Summary', icon: TrendingUp },
    { value: 'fee_collection', label: 'Fee Collection Report', icon: FileText },
    { value: 'expense_summary', label: 'Expense Summary', icon: AlertCircle },
    { value: 'mpesa_transactions', label: 'M-PESA Transactions', icon: Users },
  ];

  const academicYears = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
  ];

  const terms = [
    { value: 'Term 1', label: 'Term 1' },
    { value: 'Term 2', label: 'Term 2' },
    { value: 'Term 3', label: 'Term 3' },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      return;
    }

    const filters = {
      reportType: reportType as any,
      academicYear,
      term,
      dateFrom: dateFrom?.toISOString().split('T')[0],
      dateTo: dateTo?.toISOString().split('T')[0],
    };

    const result = await generateReport(filters);
    if (result.data) {
      setReportData(result.data);
    }
  };

  const handleDownloadReport = () => {
    if (reportData) {
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
      downloadReport(reportData, filename);
    }
  };

  const selectedReportType = reportTypes.find(type => type.value === reportType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports and analytics
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
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
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
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
                  {terms.map((termOption) => (
                    <SelectItem key={termOption.value} value={termOption.value}>
                      {termOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder="Select start date"
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <DatePicker
                date={dateTo}
                onDateChange={setDateTo}
                placeholder="Select end date"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={!reportType || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <type.icon className="h-6 w-6 text-blue-600" />
                <span className="font-medium">{type.label}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setReportType(type.value);
                  handleGenerateReport();
                }}
                disabled={loading}
              >
                Quick Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {selectedReportType && <selectedReportType.icon className="h-5 w-5" />}
              Report Preview: {selectedReportType?.label}
            </CardTitle>
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total Fees</div>
                    <div className="text-xl font-bold text-blue-900">
                      KES {reportData.summary.total_fees?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Total Collected</div>
                    <div className="text-xl font-bold text-green-900">
                      KES {reportData.summary.total_collected?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Outstanding</div>
                    <div className="text-xl font-bold text-red-900">
                      KES {reportData.summary.outstanding?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
              )}

              {reportData.collection_rate && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Collection Rate</div>
                  <div className="text-xl font-bold text-purple-900">
                    {reportData.collection_rate.toFixed(1)}%
                  </div>
                </div>
              )}

              {reportData.details && Array.isArray(reportData.details) && reportData.details.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Transaction Details</h4>
                  <div className="text-sm text-gray-600">
                    {reportData.details.length} transaction(s) found in this period.
                  </div>
                </div>
              )}

              {reportData.message && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {reportData.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReportsModule;
