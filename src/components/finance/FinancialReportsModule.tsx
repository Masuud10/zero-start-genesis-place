
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, TrendingUp, CreditCard, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FinancialReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { generateReport, downloadReport, loading } = useFinanceReports();
  const { toast } = useToast();
  
  const [reportType, setReportType] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);

  const financeReportTypes = [
    { id: 'school_financial', label: 'School Financial Summary', icon: BarChart },
    { id: 'fee_collection', label: 'Fee Collection Report', icon: CreditCard },
    { id: 'expense_summary', label: 'Expense Summary', icon: TrendingUp },
    { id: 'mpesa_transactions', label: 'MPESA Transaction Report', icon: FileText },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    const filters = {
      reportType: reportType as any,
      academicYear: academicYear || undefined,
      term: term || undefined,
    };

    const result = await generateReport(filters);
    if (result.data) {
      setReportData(result.data);
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) {
      toast({
        title: "Error",
        description: "No report data to download",
        variant: "destructive",
      });
      return;
    }

    const filename = `${reportType}_report_${Date.now()}`;
    downloadReport(reportData, filename);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Financial Reports
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive financial reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financeReportTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-colors ${
              reportType === type.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
            }`}
            onClick={() => setReportType(type.id)}
          >
            <CardContent className="p-4 text-center">
              <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium text-sm">{type.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Academic Year</label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
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
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading || !reportType}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Report Results</CardTitle>
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900">Total Fees</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      KES {(reportData.summary.total_fees || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900">Collected</h3>
                    <p className="text-2xl font-bold text-green-600">
                      KES {(reportData.summary.total_collected || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-medium text-orange-900">Outstanding</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      KES {(reportData.summary.outstanding || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900">Collection Rate</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {(reportData.summary.collection_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
              
              {reportData.message && (
                <div className="text-center py-8 text-muted-foreground">
                  {reportData.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReportsModule;
