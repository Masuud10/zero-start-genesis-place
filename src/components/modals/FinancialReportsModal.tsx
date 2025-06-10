
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinancialReportsModalProps {
  onClose: () => void;
}

const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({ onClose }) => {
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportType, setReportType] = useState('');
  const { toast } = useToast();

  const periods = ['This Month', 'Last Month', 'This Term', 'Last Term', 'This Year'];
  const reportTypes = ['Revenue Summary', 'Outstanding Fees', 'Payment Methods', 'Collection Trends'];

  const mockFinancialData = {
    totalRevenue: 2500000,
    outstanding: 350000,
    collected: 2150000,
    collectionRate: 86
  };

  const handleGenerateReport = (format: 'pdf' | 'excel') => {
    if (!reportPeriod || !reportType) {
      toast({
        title: "Error",
        description: "Please select report period and type",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Financial ${format.toUpperCase()} report generated successfully`,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Financial Reports</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period">Report Period</Label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period} value={period}>{period}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">KES {mockFinancialData.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <p className="text-2xl font-bold">KES {mockFinancialData.collected.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold">KES {mockFinancialData.outstanding.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                    <p className="text-2xl font-bold">{mockFinancialData.collectionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {reportPeriod && reportType && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">{reportType}</p>
                  <p className="text-muted-foreground mb-4">Period: {reportPeriod}</p>
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

export default FinancialReportsModal;
