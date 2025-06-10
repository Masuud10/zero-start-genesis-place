
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Search, Download } from 'lucide-react';

interface Subscription {
  id: string;
  school_id: string;
  plan_type: string;
  status: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  school: {
    name: string;
    email: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  payment_method: string;
  created_at: string;
  school: {
    name: string;
  };
}

const BillingModule = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          school:schools(name, email)
        `);

      if (subsError) throw subsError;

      // Fetch transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('billing_transactions')
        .select(`
          *,
          school:schools(name)
        `)
        .order('created_at', { ascending: false });

      if (transError) throw transError;

      // Transform the data to match our interfaces
      const transformedSubscriptions = subscriptionsData?.map(sub => ({
        ...sub,
        school: sub.school
      })) || [];

      const transformedTransactions = transactionsData?.map(trans => ({
        ...trans,
        school: trans.school
      })) || [];

      setSubscriptions(transformedSubscriptions);
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    const monthly = subscriptions
      .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);
    
    const quarterly = subscriptions
      .filter(s => s.status === 'active' && s.billing_cycle === 'quarterly')
      .reduce((sum, s) => sum + (s.amount / 3), 0); // Convert to monthly
    
    const yearly = subscriptions
      .filter(s => s.status === 'active' && s.billing_cycle === 'yearly')
      .reduce((sum, s) => sum + (s.amount / 12), 0); // Convert to monthly

    return monthly + quarterly + yearly;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      basic: 'secondary',
      premium: 'default',
      enterprise: 'destructive'
    };
    return <Badge variant={variants[plan] || 'secondary'}>{plan}</Badge>;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.school?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
          <p className="text-muted-foreground">Manage subscriptions and billing for all schools</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${calculateRevenue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {subscriptions.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Subscriptions</CardTitle>
          <CardDescription>
            Manage all school subscription plans and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading subscriptions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.school?.name}</div>
                        <div className="text-sm text-muted-foreground">{subscription.school?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(subscription.plan_type)}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>${subscription.amount}</TableCell>
                    <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                    <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(subscription.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Suspend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest billing transactions across all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.school?.name}</TableCell>
                  <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                  <TableCell>${transaction.amount}</TableCell>
                  <TableCell className="capitalize">{transaction.payment_method || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingModule;
