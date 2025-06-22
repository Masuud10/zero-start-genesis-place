
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, BarChart3, Building2, Users, DollarSign, Activity, Globe, Loader2 } from 'lucide-react';

const EduFamReportGeneration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  const reportTypes = [
    {
      id: 'platform-overview',
      label: 'Platform Overview Report',
      description: 'Complete overview of platform usage, schools, and users',
      icon: BarChart3
    },
    {
      id: 'schools-summary',
      label: 'Schools Summary Report',
      description: 'Comprehensive report of all registered schools',
      icon: Building2
    },
    {
      id: 'users-analytics',
      label: 'Users Analytics Report',
      description: 'User engagement and activity analytics',
      icon: Users
    },
    {
      id: 'financial-overview',
      label: 'Financial Overview Report',
      description: 'Platform-wide financial metrics and billing',
      icon: DollarSign
    },
    {
      id: 'system-health',
      label: 'System Health Report',
      description: 'Technical performance and system metrics',
      icon: Activity
    },
    {
      id: 'company-profile',
      label: 'Company Profile Report',
      description: 'EduFam company information and details',
      icon: Globe
    }
  ];

  const generateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call the edge function to generate the report
      const { data, error }  = await supabase.functions.invoke('generate_report', {
        body: {
          reportType: selectedReportType,
          filters: {},
          userInfo: {
            role: 'edufam_admin',
            userName: 'EduFam Admin'
          }
        }
      });

      if (error) throw error;

      // Convert the response to a blob and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edufam_${selectedReportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Report generated and downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedReportType === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedReportType(report.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  {report.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={generateReport} 
              disabled={!selectedReportType || loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EduFamReportGeneration;
