
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FinancialReportsPanel: React.FC = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions' | ''>('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [generatedReportData, setGeneratedReportData] = useState<any>(null);

  const { generateReport, downloadReport, loading } = useFinanceReports();

  // Fetch students for the dropdown
  const { data: students } = useQuery({
    queryKey: ['students', user?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number, class:classes(name)')
        .eq('school_id', user?.school_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.school_id && reportType === 'fee_collection'
  });

  // Fetch classes for the dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes', user?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', user?.school_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.school_id && reportType === 'fee_collection'
  });

  const reportTypes = [
    { value: 'school_financial', label: 'School Financial Overview Report' },
    { value: 'fee_collection', label: 'Fee Collection Report' },
    { value: 'expense_summary', label: 'Expense Summary Report' },
    { value: 'mpesa_transactions', label: 'M-PESA Transactions Report' },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) return;

    const filters = {
      reportType: reportType as 'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions',
      classId: reportType === 'fee_collection' ? selectedClass : undefined,
      academicYear: academicYear || undefined,
      term: term || undefined,
    };

    const result = await generateReport(filters);
    if (result.data) {
      setGeneratedReportData(result.data);
    }
  };

  const handleDownloadReport = () => {
    if (generatedReportData) {
      const filename = `${reportType}_report`;
      downloadReport(generatedReportData, filename);
    }
  };

  const canGenerateReport = () => {
    if (!reportType) return false;
    if (reportType === 'fee_collection' && !selectedClass) return false;
    return true;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Financial Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type *</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'fee_collection' && (
                <div>
                  <Label htmlFor="class">Class (Optional)</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.stream && `- ${cls.stream}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academic-year">Academic Year (Optional)</Label>
                  <Input
                    id="academic-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="term">Term (Optional)</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="All terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Terms</SelectItem>
                      <SelectItem value="term-1">Term 1</SelectItem>
                      <SelectItem value="term-2">Term 2</SelectItem>
                      <SelectItem value="term-3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={!canGenerateReport() || loading}
                  className="flex-1"
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
                
                {generatedReportData && (
                  <Button onClick={handleDownloadReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedReportData ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Report Type: {reportType.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm">
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="border rounded p-3 bg-gray-50 text-sm">
                    <strong>Summary:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Records found: {generatedReportData.records?.length || 0}</li>
                      <li>• Total amount: KES {generatedReportData.totalAmount?.toLocaleString() || 0}</li>
                      <li>• Period: {academicYear || 'All years'} - {term || 'All terms'}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select report type and click "Generate Report" to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setReportType('mpesa_transactions');
                handleGenerateReport();
              }}
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Today's MPESA
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setReportType('fee_collection');
                handleGenerateReport();
              }}
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Outstanding Fees
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setReportType('expense_summary');
                handleGenerateReport();
              }}
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Monthly Expenses
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setReportType('school_financial');
                handleGenerateReport();
              }}
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Financial Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportsPanel;
