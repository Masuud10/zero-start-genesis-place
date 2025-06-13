
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Plus, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SchoolOwnerStats {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  pendingFees: number;
}

interface FinancialTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
}

const SchoolOwnerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SchoolOwnerStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    pendingFees: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.school_id) {
      fetchSchoolOwnerData();
    }
  }, [user?.school_id]);

  const fetchSchoolOwnerData = async () => {
    try {
      setLoading(true);
      
      if (!user?.school_id) {
        console.log('No school_id found for user');
        return;
      }

      // Fetch students count
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch teachers count
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', user.school_id)
        .in('role', ['teacher', 'principal']);

      if (teachersError) throw teachersError;

      // Fetch financial data
      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_type, description, created_at')
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Calculate total revenue from completed transactions
      const totalRevenue = transactions
        ?.filter(t => t.transaction_type === 'fee_payment')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Fetch pending fees
      const { data: pendingFees, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount')
        .eq('school_id', user.school_id)
        .eq('status', 'pending');

      if (feesError) throw feesError;

      const totalPendingFees = pendingFees
        ?.reduce((sum, fee) => sum + (Number(fee.amount) - Number(fee.paid_amount || 0)), 0) || 0;

      // Format recent transactions
      const formattedTransactions = transactions?.slice(0, 5).map(transaction => ({
        id: transaction.created_at,
        amount: Number(transaction.amount),
        description: transaction.description || 'Financial transaction',
        date: transaction.created_at,
        type: transaction.transaction_type
      })) || [];

      setStats({
        totalStudents: students?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalRevenue,
        pendingFees: totalPendingFees
      });

      setRecentTransactions(formattedTransactions);

    } catch (error: any) {
      console.error('Error fetching school owner data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Active students enrolled",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Staff",
      value: stats.totalTeachers,
      description: "Teachers and administrators",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      description: "Fees collected this year",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Pending Fees",
      value: `KSh ${stats.pendingFees.toLocaleString()}`,
      description: "Outstanding payments",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            School Management
          </CardTitle>
          <CardDescription>
            Key administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <GraduationCap className="h-6 w-6" />
              <span>Manage Staff</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <DollarSign className="h-6 w-6" />
              <span>Financial Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <Plus className="h-6 w-6" />
              <span>Add Resources</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Financial Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Activities</CardTitle>
          <CardDescription>
            Latest transactions and fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KSh {transaction.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerDashboard;
