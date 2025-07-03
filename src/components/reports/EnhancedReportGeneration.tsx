import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Clock, Eye, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GeneratedReport {
  id: string;
  report_type: string;
  generated_at: string;
  filters: any;
  generated_by: string;
  school_id: string;
}

interface EnhancedReportGenerationProps {
  schoolId: string;
}

const EnhancedReportGeneration: React.FC<EnhancedReportGenerationProps> = ({ schoolId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([]);
  const [reportType, setReportType] = useState<string>('');
  const [termFilter, setTermFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');

  // Load report history
  useEffect(() => {
    loadReportHistory();
  }, [schoolId]);

  const loadReportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('school_id', schoolId)
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReportHistory(data || []);
    } catch (error) {
      console.error('Error loading report history:', error);
    }
  };

  const generateReport = async () => {
    if (!reportType) {
      toast({
        title: "Validation Error",
        description: "Please select a report type",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🔄 Generating report:', { reportType, schoolId, termFilter, classFilter });

      // Call the report generation function
      const { data, error } = await supabase.functions.invoke('generate_report', {
        body: {
          reportType,
          schoolId,
          filters: {
            term: termFilter || undefined,
            class: classFilter || undefined,
            academic_year: new Date().getFullYear().toString()
          }
        }
      });

      if (error) throw error;

      // Save report to database for history
      const { error: saveError } = await supabase
        .from('reports')
        .insert({
          school_id: schoolId,
          report_type: reportType,
          generated_by: user?.id,
          report_data: data || {},
          filters: {
            term: termFilter || undefined,
            class: classFilter || undefined,
            academic_year: new Date().getFullYear().toString()
          }
        });

      if (saveError) {
        console.error('Error saving report:', saveError);
      }

      toast({
        title: "Report Generated",
        description: "Report has been generated successfully and added to history.",
      });

      // Refresh history
      await loadReportHistory();

      // Reset form
      setReportType('');
      setTermFilter('');
      setClassFilter('');

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      // Create downloadable content
      const reportContent = JSON.stringify(data.report_data, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.report_type}_${new Date(data.generated_at).toLocaleDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: "Report downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic_performance">Academic Performance</SelectItem>
                  <SelectItem value="attendance_summary">Attendance Summary</SelectItem>
                  <SelectItem value="financial_overview">Financial Overview</SelectItem>
                  <SelectItem value="class_performance">Class Performance</SelectItem>
                  <SelectItem value="student_progress">Student Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Term (Optional)</label>
              <Select value={termFilter} onValueChange={setTermFilter}>
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

            <div>
              <label className="text-sm font-medium">Class (Optional)</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={isGenerating || !reportType}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Report History ({reportHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet. Generate your first report above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <h4 className="font-medium capitalize">
                      {report.report_type.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(report.generated_at).toLocaleDateString()} at{' '}
                      {new Date(report.generated_at).toLocaleTimeString()}
                    </p>
                    {report.filters && Object.keys(report.filters).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(report.filters).map(([key, value]) => (
                          value && (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value as string}
                            </Badge>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReport(report.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4 border-t">
        Powered by EduFam
      </div>
    </div>
  );
};

export default EnhancedReportGeneration;