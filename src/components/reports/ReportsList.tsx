
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/hooks/useReports';
import { Trash2, Download, Eye, FileText, Users, DollarSign, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

const ReportsList = () => {
  const { reports, isLoading, deleteReport, isDeleting, canViewReports } = useReports();

  if (!canViewReports) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">You don't have permission to view reports.</p>
        </CardContent>
      </Card>
    );
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'individual_academic':
        return <FileText className="h-4 w-4" />;
      case 'class_academic':
        return <Users className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'attendance':
        return <CalendarCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'individual_academic':
        return 'Individual Academic';
      case 'class_academic':
        return 'Class Academic';
      case 'financial':
        return 'Financial';
      case 'attendance':
        return 'Attendance';
      default:
        return type;
    }
  };

  const getReportTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'individual_academic':
        return 'bg-blue-100 text-blue-800';
      case 'class_academic':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-yellow-100 text-yellow-800';
      case 'attendance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-500">Generate your first report to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getReportTypeIcon(report.report_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {getReportTypeLabel(report.report_type)} Report
                    </h4>
                    <Badge className={getReportTypeBadgeColor(report.report_type)}>
                      {getReportTypeLabel(report.report_type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Generated on {format(new Date(report.generated_at), 'PPp')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteReport(report.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsList;
