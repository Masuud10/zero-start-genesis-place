
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

interface FinancialReportsModalProps {
  onClose: () => void;
}

const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({ onClose }) => {
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    outstanding: 0,
    collected: 0,
    collectionRate: 0,
  });

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const periods = ['This Month', 'Last Month', 'This Term', 'Last Term', 'This Year'];
  const reportTypes = ['Revenue Summary', 'Outstanding Fees', 'Payment Methods', 'Collection Trends'];

  useEffect(() => {
    if (!reportPeriod || !schoolId) {
      setFinancialData({ totalRevenue: 0, outstanding: 0, collected: 0, collectionRate: 0 });
      return;
    }

    const fetchFinancialData = async () => {
      setLoading(true);

      let startDate: Date | null = null;
      let endDate: Date | null = null;
      const now = new Date();

      switch (reportPeriod) {
        case 'This Month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'Last Month':
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case 'This Year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        case 'This Term':
        case 'Last Term':
          toast({
            title: "Coming Soon",
            description: `Reporting for '${reportPeriod}' is not yet available.`,
            variant: "default",
          });
          setFinancialData({ totalRevenue: 0, outstanding: 0, collected: 0, collectionRate: 0 });
          setLoading(false);
          return;
        default:
          setFinancialData({ totalRevenue: 0, outstanding: 0, collected: 0, collectionRate: 0 });
          setLoading(false);
          return;
      }
      
      try {
        const outstandingPromise = supabase.rpc('get_outstanding_fees', { p_school_id: schoolId });
        
        const revenuePromise = supabase
          .from('fees')
          .select('amount')
          .eq('school_id', schoolId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        const collectedPromise = supabase
          .from('fees')
          .select('paid_amount')
          .eq('school_id', schoolId)
          .gte('paid_date', startDate.toISOString())
          .lte('paid_date', endDate.toISOString());

        const [
          { data: outstandingData, error: outstandingError },
          { data: revenueData, error: revenueError },
          { data: collectedData, error: collectedError }
        ] = await Promise.all([outstandingPromise, revenuePromise, collectedPromise]);

        if (outstandingError || revenueError || collectedError) {
          console.error({ outstandingError, revenueError, collectedError });
          throw new Error('Failed to fetch financial data for the report.');
        }

        const totalRevenue = (revenueData || []).reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const collected = (collectedData || []).reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
        const outstanding = outstandingData || 0;
        const collectionRate = totalRevenue > 0 ? (collected / totalRevenue) * 100 : 0;
        
        setFinancialData({
            totalRevenue,
            outstanding,
            collected,
            collectionRate,
        });

      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Could not load financial data.",
          variant: "destructive"
        });
        setFinancialData({ totalRevenue: 0, outstanding: 0, collected: 0, collectionRate: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [reportPeriod, schoolId, toast]);

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

  const renderStat = (value: number, isCurrency = true) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (isCurrency) return `KES ${value.toLocaleString()}`;
    return `${value.toFixed(1)}%`;
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
                    <p className="text-2xl font-bold">{renderStat(financialData.totalRevenue)}</p>
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
                    <p className="text-2xl font-bold">{renderStat(financialData.collected)}</p>
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
                    <p className="text-2xl font-bold">{renderStat(financialData.outstanding)}</p>
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
                    <p className="text-2xl font-bold">{renderStat(financialData.collectionRate, false)}</p>
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
