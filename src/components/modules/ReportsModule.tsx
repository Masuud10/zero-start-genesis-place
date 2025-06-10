
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, BarChart3, TrendingUp, Download, Calendar, Users, DollarSign, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportsModule = () => {
  const [reportType, setReportType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'schools-summary', label: 'Schools Summary Report', icon: Building2 },
    { value: 'users-analytics', label: 'Users Analytics Report', icon: Users },
    { value: 'financial-summary', label: 'Financial Summary Report', icon: DollarSign },
    { value: 'system-performance', label: 'System Performance Report', icon: TrendingUp },
    { value: 'subscription-analysis', label: 'Subscription Analysis Report', icon: BarChart3 },
    { value: 'support-tickets', label: 'Support Tickets Report', icon: FileText },
  ];

  const periods = [
    'Last 7 days',
    'Last 30 days', 
    'Last 3 months',
    'Last 6 months',
    'This Year',
    'All Time'
  ];

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportType || !selectedPeriod) {
      toast({
        title: "Error",
        description: "Please select report type and period",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedReport = reportTypes.find(r => r.value === reportType);
      toast({
        title: "Report Generated",
        description: `${selectedReport?.label} has been generated successfully.`,
      });
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${reportType}_${selectedPeriod.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reportStats = [
    { title: "Generated Reports", value: "156", icon: FileText, color: "from-blue-500 to-blue-600" },
    { title: "Report Types", value: "6", icon: BarChart3, color: "from-green-500 to-green-600" },
    { title: "This Month", value: "23", icon: Calendar, color: "from-orange-500 to-orange-600" },
    { title: "Downloads", value: "89", icon: Download, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Reports & Analytics
        </h1>
        <p className="text-muted-foreground">Generate comprehensive reports for the Elimisha network</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Time Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>{period}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportType && selectedPeriod && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {reportTypes.find(t => t.value === reportType)?.label}
              </p>
              <p className="text-muted-foreground mb-4">
                Period: {selectedPeriod}
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => handleGenerateReport('pdf')} 
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('excel')} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('csv')} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => {
                setReportType('schools-summary');
                setSelectedPeriod('Last 30 days');
              }}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm">Schools Summary</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => {
                setReportType('financial-summary');
                setSelectedPeriod('Last 30 days');
              }}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Financial Summary</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
              onClick={() => {
                setReportType('users-analytics');
                setSelectedPeriod('Last 30 days');
              }}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">User Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsModule;
