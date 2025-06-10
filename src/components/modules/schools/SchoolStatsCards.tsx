
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  subscriptions?: {
    plan_type: string;
    status: string;
    amount: number;
  }[];
}

interface SchoolStatsCardsProps {
  schools: School[];
}

const SchoolStatsCards = ({ schools }: SchoolStatsCardsProps) => {
  const activeSubscriptions = schools.filter(s => s.subscriptions?.[0]?.status === 'active').length;
  const monthlyRevenue = schools
    .filter(s => s.subscriptions?.[0]?.status === 'active')
    .reduce((sum, s) => sum + (s.subscriptions?.[0]?.amount || 0), 0);
  
  const newThisMonth = schools.filter(s => {
    const created = new Date(s.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

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
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Paying customers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From active subscriptions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newThisMonth}</div>
          <p className="text-xs text-muted-foreground">Schools added</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolStatsCards;
