
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, BarChart3, TrendingUp, Download, Calendar, Users, DollarSign, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const ReportsModule = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [dateRange, setDateRange] = useState('');

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance Report', roles: ['school_owner', 'principal', 'teacher'] },
    { value: 'attendance', label: 'Attendance Report', roles: ['school_owner', 'principal', 'teacher'] },
    { value: 'financial', label: 'Financial Report', roles: ['school_owner', 'principal', 'finance_officer'] },
    { value: 'class-summary', label: 'Class Summary Report', roles: ['school_owner', 'principal', 'teacher'] },
    { value: 'student-progress', label: 'Student Progress Report', roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { value: 'fee-collection', label: 'Fee Collection Report', roles: ['school_owner', 'principal', 'finance_officer'] },
    { value: 'teacher-performance', label: 'Teacher Performance Report', roles: ['school_owner', 'principal'] },
    { value: 'expenses', label: 'Expenses Report', roles: ['school_owner', 'principal', 'finance_officer'] },
  ];

  const mockTerms = ['Term 1 2024', 'Term 2 2024', 'Term 3 2024'];
  const mockClasses = ['All Classes', 'Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'];
  const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'Custom'];

  const filteredReportTypes = reportTypes.filter(type => 
    type.roles.includes(user?.role || '')
  );

  const handleGenerateReport = (format: 'pdf' | 'excel') => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `${format.toUpperCase()} report generated successfully`,
    });
    
    // Simulate download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `report-${reportType}-${Date.now()}.${format}`;
      link.click();
    }, 1000);
  };

  const reportStats = [
    { title: "Generated Reports", value: "45", icon: FileText, color: "from-blue-500 to-blue-600" },
    { title: "Report Types", value: "8", icon: BarChart3, color: "from-green-500 to-green-600" },
    { title: "Analytics Insights", value: "25", icon: TrendingUp, color: "from-orange-500 to-orange-600" },
    { title: "Downloads", value: "125", icon: Download, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {filteredReportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {mockTerms.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportType && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {filteredReportTypes.find(t => t.value === reportType)?.label}
              </p>
              <p className="text-muted-foreground mb-4">
                Term: {selectedTerm || 'All Terms'} | Class: {selectedClass || 'All Classes'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => handleGenerateReport('pdf')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button onClick={() => handleGenerateReport('excel')} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Excel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Report Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => setReportType('academic')}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm">Academic Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => setReportType('attendance')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Attendance Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => setReportType('financial')}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Financial Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => setReportType('class-summary')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Class Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Academic Performance</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive academic performance and progress reports with detailed analytics
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Attendance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed attendance patterns and trend analysis with insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Financial Reports</h3>
              <p className="text-sm text-muted-foreground">
                Fee collection, expenses, and comprehensive financial summaries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsModule;
