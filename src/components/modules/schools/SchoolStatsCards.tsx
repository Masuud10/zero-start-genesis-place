
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SchoolStatsCardsProps {
  schools: any[];
}

const SchoolStatsCards = ({ schools }: SchoolStatsCardsProps) => {
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Get active subscriptions
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'active');

        if (subscriptionsError) {
          console.error('Error fetching subscriptions:', subscriptionsError);
          return;
        }

        const activeSubscriptions = subscriptions?.length || 0;
        const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
        
        const newThisMonth = schools.filter(s => {
          const created = new Date(s.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        setStats({
          activeSubscriptions,
          monthlyRevenue,
          newThisMonth
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    if (schools.length > 0) {
      calculateStats();
    }
  }, [schools]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{schools.length}</div>
          <p className="text-xs text-muted-foreground">Active institutions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Paying customers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From active subscriptions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          <p className="text-xs text-muted-foreground">Schools added</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolStatsCards;
