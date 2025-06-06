
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ReportsModalProps {
  onClose: () => void;
}

const ReportsModal = ({ onClose }: ReportsModalProps) => {
  const [reportType, setReportType] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance Report' },
    { value: 'attendance', label: 'Attendance Summary Report' },
    { value: 'finance', label: 'Financial Report' },
    { value: 'comprehensive', label: 'Comprehensive School Report' },
  ];

  const classes = ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B', 'Grade 3A'];

  const handleClassSelection = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, classId]);
    } else {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    }
  };

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      type: reportType,
      term: selectedTerm,
      classes: selectedClasses,
      charts: includeCharts,
      format: exportFormat
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Generate Reports</DialogTitle>
          <DialogDescription>
            Create comprehensive reports for academic performance and school analytics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
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
            
            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term-1">Term 1 - 2024</SelectItem>
                  <SelectItem value="term-2">Term 2 - 2024</SelectItem>
                  <SelectItem value="term-3">Term 3 - 2024</SelectItem>
                  <SelectItem value="all">All Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Selection */}
          {reportType && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Select Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {classes.map((className) => (
                    <div key={className} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`class-${className}`}
                        checked={selectedClasses.includes(className)}
                        onCheckedChange={(checked) => 
                          handleClassSelection(className, !!checked)
                        }
                      />
                      <label 
                        htmlFor={`class-${className}`} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {className}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedClasses(classes)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => setSelectedClasses([])}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Options */}
          {reportType && selectedClasses.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Report Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                  />
                  <label 
                    htmlFor="include-charts" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Include charts and graphs
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Export Format</label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Preview */}
          {reportType && selectedClasses.length > 0 && (
            <Card className="border border-border bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Report Preview</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Type:</strong> {reportTypes.find(t => t.value === reportType)?.label}</p>
                  <p><strong>Term:</strong> {selectedTerm === 'all' ? 'All Terms' : selectedTerm}</p>
                  <p><strong>Classes:</strong> {selectedClasses.join(', ')}</p>
                  <p><strong>Format:</strong> {exportFormat.toUpperCase()}</p>
                  <p><strong>Includes Charts:</strong> {includeCharts ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={!reportType || selectedClasses.length === 0 || !selectedTerm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
