
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { useFinanceReports } from '@/hooks/useFinanceReports';
import { useToast } from '@/hooks/use-toast';

interface ReportFilters {
  reportType: 'individual_student' | 'class_financial' | 'school_financial';
  dateFrom: string;
  dateTo: string;
  academicYear: string;
  term: string;
}

const FinancialReportsGenerator: React.FC = () => {
  const { generateReport, downloadReport, loading } = useFinanceReports();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'school_financial',
    dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1'
  });

  const reportTypes = [
    {
      value: 'school_financial',
      label: 'School Financial Summary',
      description: 'Complete financial overview including revenue, expenses, and outstanding fees',
      icon: BarChart3
    },
    {
      value: 'class_financial',
      label: 'Class Financial Report',
      description: 'Fee collection and outstanding balances per class',
      icon: Users
    },
    {
      value: 'individual_student',
      label: 'Student Financial Report',
      description: 'Individual student fee statements and payment history',
      icon: FileText
    }
  ];

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport(filters);
      
      if (result.data) {
        const filename = `${filters.reportType}_${filters.academicYear}_${filters.term}`;
        await downloadReport(result.data, filename);
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }
  };

  const quickReports = [
    {
      name: 'Monthly Collection Summary',
      description: 'Current month fee collection status',
      action: () => generateReport({
        reportType: 'school_financial',
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        academicYear: new Date().getFullYear().toString(),
        term: 'current'
      })
    },
    {
      name: 'Outstanding Balances',
      description: 'All pending fee payments',
      action: () => generateReport({
        reportType: 'class_financial',
        academicYear: new Date().getFullYear().toString(),
        term: 'current'
      })
    },
    {
      name: 'Annual Financial Report',
      description: 'Complete year financial summary',
      action: () => generateReport({
        reportType: 'school_financial',
        academicYear: new Date().getFullYear().toString()
      })
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Financial Reports Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Reports */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickReports.map((report, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-2">{report.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={report.action}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Report Generator */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Custom Reports</h3>
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <Label>Report Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {reportTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      filters.reportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, reportType: type.value as any }))}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <type.icon className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={filters.academicYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label htmlFor="term">Term</Label>
                <Select 
                  value={filters.term} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, term: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                    <SelectItem value="current">Current Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Report History */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">School Financial Summary - Term 1 2024</p>
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant="secondary">Downloaded</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReportsGenerator;
