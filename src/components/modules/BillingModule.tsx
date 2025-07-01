
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, CreditCard, DollarSign, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BillingRecord {
  id: string;
  school_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  school?: {
    name: string;
  };
}

const BillingModule = () => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupFee, setSetupFee] = useState(500);
  const [monthlyFee, setMonthlyFee] = useState(50);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access billing data.');
      }

      const { data, error: fetchError } = await supabase
        .from('school_billing_records')
        .select(`
          id,
          school_id,
          invoice_number,
          amount,
          status,
          created_at,
          schools!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setBillingRecords(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load billing data';
      setError(errorMessage);
      console.error('🔴 BillingModule: Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceForSchool = async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: schoolId,
          amount: setupFee + monthlyFee,
          status: 'pending',
          billing_type: 'monthly'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invoice Generated",
        description: `Invoice created successfully for school`,
      });

      fetchBillingData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate invoice",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [user]);

  if (!user || user.role !== 'edufam_admin') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access billing management.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading billing data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          {error}
          <Button
            onClick={fetchBillingData}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const totalRevenue = billingRecords.reduce((sum, record) => sum + record.amount, 0);
  const pendingInvoices = billingRecords.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Billing Management</h2>
          <p className="text-muted-foreground">Manage school billing and invoices</p>
        </div>
        <Button onClick={fetchBillingData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Configuration</CardTitle>
          <CardDescription>Set default billing amounts for schools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setupFee">Setup Fee (KES)</Label>
              <Input
                id="setupFee"
                type="number"
                value={setupFee}
                onChange={(e) => setSetupFee(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Monthly Subscription (KES)</Label>
              <Input
                id="monthlyFee"
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Billing Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Records</CardTitle>
          <CardDescription>Latest billing activity across all schools</CardDescription>
        </CardHeader>
        <CardContent>
          {billingRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No billing records found
            </div>
          ) : (
            <div className="space-y-4">
              {billingRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{record.school?.name || 'Unknown School'}</p>
                    <p className="text-sm text-muted-foreground">
                      Invoice: {record.invoice_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">KES {record.amount.toLocaleString()}</p>
                    <p className={`text-xs px-2 py-1 rounded ${
                      record.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : record.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingModule;
