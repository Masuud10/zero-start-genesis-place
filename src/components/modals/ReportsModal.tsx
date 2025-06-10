
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ReportsModalProps {
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance Report' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'class-summary', label: 'Class Summary Report' },
  ];

  const mockTerms = ['Term 1 2024', 'Term 2 2024', 'Term 3 2024'];
  const mockClasses = ['All Classes', 'Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'];

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Reports</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {reportType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Report Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    {reportTypes.find(t => t.value === reportType)?.label}
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
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsModal;
