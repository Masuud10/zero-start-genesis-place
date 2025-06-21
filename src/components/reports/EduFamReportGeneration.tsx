
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  School,
  Calendar,
  RefreshCw
} from 'lucide-react';

const EduFamReportGeneration = () => {
  const [reportType, setReportType] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { 
    isGenerating, 
    reportData, 
    generateSchoolReport, 
    generateCompanyReport, 
    exportToCSV, 
    clearReportData 
  } = useReportGeneration();

  const reportTypes = [
    { value: 'schools_overview', label: 'Schools Overview', icon: School, type: 'company' },
    { value: 'revenue_analytics', label: 'Revenue Analytics', icon: DollarSign, type: 'company' },
    { value: 'active_schools', label: 'Active vs Inactive Schools', icon: TrendingUp, type: 'company' },
    { value: 'system_health', label: 'System Health Report', icon: BarChart3, type: 'company' },
    { value: 'user_activity', label: 'User Activity Report', icon: Users, type: 'company' },
    { value: 'grade_distribution', label: 'Grade Distribution', icon: BarChart3, type: 'school' },
    { value: 'attendance_summary', label: 'Attendance Summary', icon: Users, type: 'school' },
    { value: 'fees_collection', label: 'Fees Collection', icon: DollarSign, type: 'school' },
    { value: 'class_performance', label: 'Class Performance', icon: TrendingUp, type: 'school' },
    { value: 'certificates_generated', label: 'Certificates Generated', icon: FileText, type: 'school' },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) return;

    const filters = {
      reportType,
      school: schoolFilter,
      academicYear,
      term,
      dateFrom,
      dateTo
    };

    const selectedReportType = reportTypes.find(rt => rt.value === reportType);
    
    if (selectedReportType?.type === 'company') {
      await generateCompanyReport(filters);
    } else {
      await generateSchoolReport(filters);
    }
  };

  const handleExportToCSV = () => {
    if (reportData?.data) {
      exportToCSV(reportData.data, `${reportType}_report`);
    }
  };

  const selectedReportType = reportTypes.find(rt => rt.value === reportType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">EduFam Report Generation</h2>
        <p className="text-muted-foreground">
          Generate comprehensive reports across all schools and system metrics
        </p>
      </div>

      {/* Report Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
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
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-500 mb-2">Company Reports</div>
                    {reportTypes.filter(rt => rt.type === 'company').map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                    <div className="text-sm font-medium text-gray-500 mb-2 mt-4">School Reports</div>
                    {reportTypes.filter(rt => rt.type === 'school').map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024"
              />
            </div>

            <div>
              <Label htmlFor="term">Term (Optional)</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term_1">Term 1</SelectItem>
                  <SelectItem value="term_2">Term 2</SelectItem>
                  <SelectItem value="term_3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedReportType?.type === 'school' && (
              <div>
                <Label htmlFor="schoolFilter">School Filter (Optional)</Label>
                <Input
                  id="schoolFilter"
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  placeholder="School ID"
                />
              </div>
            )}

            <div>
              <Label htmlFor="dateFrom">Date From (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateReport} 
              disabled={!reportType || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>

            {reportData && (
              <Button 
                variant="outline" 
                onClick={handleExportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}

            {reportData && (
              <Button 
                variant="outline" 
                onClick={clearReportData}
              >
                Clear Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {reportData.title}
              </div>
              <Badge variant="secondary">
                {reportData.summary?.totalRecords || 0} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </div>

              {/* Summary Statistics */}
              {reportData.summary?.aggregateData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {Object.entries(reportData.summary.aggregateData).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-xl font-bold">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Preview */}
              {reportData.data && reportData.data.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Data Preview (First 10 records)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(reportData.data[0]).slice(0, 5).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b">
                            {Object.values(row).slice(0, 5).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                                {typeof value === 'object' && value !== null 
                                  ? JSON.stringify(value).slice(0, 50) + '...'
                                  : String(value || '').slice(0, 50)
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EduFamReportGeneration;
