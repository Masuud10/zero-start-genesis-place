
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

const FinanceReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState<'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions' | ''>('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [generatedReportData, setGeneratedReportData] = useState<any>(null);

  const { generateReport, downloadReport, loading } = useFinanceReports();
  const { schoolId } = useSchoolScopedData();

  // Fetch students for the dropdown
  const { data: students } = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number, class:classes(name)')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId && reportType === 'fee_collection'
  });

  // Fetch classes for the dropdown
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId && reportType === 'fee_collection'
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
        <h3 className="text-xl font-semibold">Financial Reports</h3>
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

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={!canGenerateReport() || loading}
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
                <Button 
                  variant="outline" 
                  onClick={handleDownloadReport}
                  disabled={!generatedReportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          {generatedReportData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {reportTypes.find(t => t.value === reportType)?.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Generated on: {new Date().toLocaleString()}
                    </p>
                    {academicYear && (
                      <p className="text-sm text-gray-600">
                        Academic Year: {academicYear}
                      </p>
                    )}
                    {term && (
                      <p className="text-sm text-gray-600">
                        Term: {term}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
                    <pre>{JSON.stringify(generatedReportData, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Available Reports</p>
                      <p className="text-xs text-gray-500">Finance officers can generate</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">4</span>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Payment Methods</p>
                      <p className="text-xs text-gray-500">Supported integrations</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">5</span>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Security Level</p>
                      <p className="text-xs text-gray-500">Multi-tenant isolation</p>
                    </div>
                    <span className="text-lg font-bold text-purple-600">★★★</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinanceReportsPanel;
