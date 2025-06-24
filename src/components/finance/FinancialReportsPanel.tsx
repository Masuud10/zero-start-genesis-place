
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Calendar, TrendingUp, Users, CreditCard, AlertCircle } from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useToast } from '@/hooks/use-toast';

const FinancialReportsPanel: React.FC = () => {
  const { generateReport, downloadReport, loading } = useFinanceReports();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions'>('school_financial');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState('');

  const reportTypes = [
    { value: 'school_financial', label: 'School Financial Summary', icon: TrendingUp },
    { value: 'fee_collection', label: 'Fee Collection Report', icon: Users },
    { value: 'expense_summary', label: 'Expense Summary', icon: FileText },
    { value: 'mpesa_transactions', label: 'MPESA Transactions', icon: CreditCard },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Validation Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    const filters = {
      reportType,
      academicYear,
      term: term || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    const { data, error } = await generateReport(filters);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const filename = `${reportType}_report_${academicYear}${term ? `_${term}` : ''}_${new Date().toISOString().split('T')[0]}`;
      downloadReport(data, filename);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Financial Reports
          </h2>
          <p className="text-muted-foreground">Generate and export comprehensive financial reports</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
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

            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term (Optional)</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Terms</SelectItem>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.value} className={reportType === type.value ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <type.icon className="h-5 w-5" />
                {type.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {type.value === 'school_financial' && 'Complete financial overview including total fees, collections, and outstanding amounts.'}
                {type.value === 'fee_collection' && 'Detailed breakdown of fee collections by class, term, and payment method.'}
                {type.value === 'expense_summary' && 'Summary of all school expenses categorized by type and period.'}
                {type.value === 'mpesa_transactions' && 'Complete list of all MPESA payment transactions with status and details.'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Report Generation Tips:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
            <li>Select the appropriate report type for your needs</li>
            <li>Use date filters for specific time periods</li>
            <li>Reports are generated in PDF format for easy sharing</li>
            <li>All financial data is up-to-date as of report generation time</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default FinancialReportsPanel;
