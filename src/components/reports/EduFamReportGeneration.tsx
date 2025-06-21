
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { 
  FileText, 
  Download, 
  Filter, 
  School, 
  GraduationCap, 
  DollarSign, 
  Users, 
  BarChart3,
  TrendingUp,
  Building2,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  AlertCircle
} from 'lucide-react';

const EduFamReportGeneration = () => {
  const [activeTab, setActiveTab] = useState('school-reports');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [academicYear, setAcademicYear] = useState('2024');
  const [term, setTerm] = useState('');
  const { toast } = useToast();

  const {
    isGenerating,
    reportData,
    generateSchoolReport,
    generateCompanyReport,
    exportToCSV,
    clearReportData
  } = useReportGeneration();

  // Fetch schools for filtering
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      console.log('🏫 Fetching schools for report filtering');
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, location, created_at')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      console.log('✅ Fetched schools:', data?.length || 0);
      return data;
    }
  });

  const schoolReportTypes = [
    {
      category: 'Academic Reports',
      icon: GraduationCap,
      color: 'blue',
      reports: [
        { value: 'grade_distribution', label: 'Grade Distribution Report', description: 'Performance across all subjects and classes' },
        { value: 'class_performance', label: 'Class Performance Summary', description: 'Overall class performance metrics' },
        { value: 'subject_analysis', label: 'Subject Performance Analysis', description: 'Top and low performing subjects' }
      ]
    },
    {
      category: 'Attendance Reports',
      icon: Users,
      color: 'green',
      reports: [
        { value: 'attendance_summary', label: 'Attendance Summary', description: 'Overall attendance statistics' },
        { value: 'absenteeism_trends', label: 'Absenteeism Trends', description: 'Attendance patterns and trends' }
      ]
    },
    {
      category: 'Finance Reports',
      icon: DollarSign,
      color: 'orange',
      reports: [
        { value: 'fees_collection', label: 'Fees Collection Report', description: 'Fee payment status and collections' },
        { value: 'outstanding_balances', label: 'Outstanding Balances', description: 'Unpaid fees and defaulters' }
      ]
    }
  ];

  const companyReportTypes = [
    {
      category: 'School Management',
      icon: School,
      color: 'indigo',
      reports: [
        { value: 'schools_overview', label: 'Schools Overview', description: 'All registered schools summary' },
        { value: 'active_schools', label: 'Active vs Inactive Schools', description: 'School status breakdown' }
      ]
    },
    {
      category: 'Business Analytics',
      icon: TrendingUp,
      color: 'emerald',
      reports: [
        { value: 'revenue_analytics', label: 'Revenue Analytics', description: 'Subscription and revenue tracking' },
        { value: 'feature_usage', label: 'Feature Usage Analytics', description: 'Most and least used features' }
      ]
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to generate.",
        variant: "destructive",
      });
      return;
    }

    const filters = {
      reportType: selectedReportType,
      school: selectedSchool,
      academicYear,
      term
    };

    console.log('🔄 Generating report with filters:', filters);

    let result;
    if (activeTab === 'school-reports') {
      result = await generateSchoolReport(filters);
    } else {
      result = await generateCompanyReport(filters);
    }

    if (result) {
      toast({
        title: "Report Generated",
        description: `${result.title} generated successfully with ${result.data.length} records.`,
      });
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    exportToCSV(
      reportData.data,
      reportData.title.replace(/\s+/g, '_')
    );

    toast({
      title: "Excel Downloaded",
      description: "Report has been exported to CSV successfully.",
    });
  };

  const renderReportCategories = (categories: any[]) => (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.category} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <category.icon className={`w-5 h-5 text-${category.color}-600`} />
              <h3 className="text-lg font-semibold">{category.category}</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {category.reports.map((report: any) => (
                <div
                  key={report.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedReportType === report.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReportType(report.value)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{report.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                    {selectedReportType === report.value && (
                      <Badge variant="default" className="bg-blue-600">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSummaryCard = () => {
    if (!reportData?.summary?.aggregateData) return null;

    const { aggregateData } = reportData.summary;

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(aggregateData).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {typeof value === 'number' ? 
                    (key.includes('Rate') || key.includes('Percentage') ? 
                      `${value.toFixed(1)}%` : value.toLocaleString()
                    ) : 
                    JSON.stringify(value).length > 50 ? 
                      'Multiple' : String(value)
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Report Generation</h2>
          <p className="text-muted-foreground">Generate comprehensive reports with real-time data</p>
        </div>
        <div className="flex gap-2">
          {reportData && (
            <Button variant="outline" onClick={clearReportData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="school-reports" className="flex items-center gap-2">
            <School className="w-4 h-4" />
            School Reports
          </TabsTrigger>
          <TabsTrigger value="company-reports" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="school">School (Optional)</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool} disabled={schoolsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={schoolsLoading ? "Loading schools..." : "All Schools"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Schools</SelectItem>
                    {schools?.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name} {school.location && `(${school.location})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024"
                />
              </div>
              
              <div>
                <Label htmlFor="term">Term (Optional)</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Terms</SelectItem>
                    <SelectItem value="term-1">Term 1</SelectItem>
                    <SelectItem value="term-2">Term 2</SelectItem>
                    <SelectItem value="term-3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {renderReportCategories(schoolReportTypes)}
        </TabsContent>

        <TabsContent value="company-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Company-Wide Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate comprehensive reports across all schools and analyze platform performance.
              </p>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Company Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {renderReportCategories(companyReportTypes)}
        </TabsContent>
      </Tabs>

      {/* Report Results */}
      {reportData && (
        <>
          {renderSummaryCard()}
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {reportData.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generated on {new Date(reportData.generatedAt).toLocaleString()} • {reportData.data.length} records
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download className="w-4 h-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(reportData.data[0]).map((key) => (
                          <TableHead key={key} className="font-semibold">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data.slice(0, 100).map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.entries(row).map(([key, value]: [string, any]) => (
                            <TableCell key={key} className="max-w-xs">
                              <div className="truncate" title={String(value)}>
                                {typeof value === 'object' && value !== null ? 
                                  JSON.stringify(value) : 
                                  String(value || '-')
                                }
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {reportData.data.length > 100 && (
                    <div className="text-center mt-4 text-sm text-muted-foreground">
                      Showing first 100 of {reportData.data.length} records. Export to view all data.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
                  <p className="text-muted-foreground">
                    No data found for the selected filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EduFamReportGeneration;
