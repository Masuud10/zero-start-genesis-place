import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Mail,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Phone,
  MessageSquare
} from 'lucide-react';

const SalesMarketingDashboard = () => {
  // Mock data for demonstration
  const salesMetrics = {
    monthlyRevenue: '$47,892',
    newLeads: 156,
    conversionRate: '24.3%',
    activeCampaigns: 8
  };

  const recentLeads = [
    { id: 1, name: 'Acme Corporation', value: '$15,000', status: 'hot', contact: 'john@acme.com' },
    { id: 2, name: 'Tech Solutions Inc', value: '$8,500', status: 'warm', contact: 'sarah@techsol.com' },
    { id: 3, name: 'Global Enterprises', value: '$22,000', status: 'cold', contact: 'mike@global.com' },
  ];

  const activeCampaigns = [
    { id: 1, name: 'Q4 Product Launch', budget: '$12,000', performance: 'high', clicks: 2847 },
    { id: 2, name: 'Holiday Special', budget: '$8,500', performance: 'medium', clicks: 1923 },
    { id: 3, name: 'Email Newsletter', budget: '$3,200', performance: 'high', clicks: 5612 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales & Marketing Dashboard</h1>
          <p className="text-muted-foreground">Track sales performance and marketing campaigns</p>
        </div>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Sales Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{salesMetrics.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{salesMetrics.newLeads}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{salesMetrics.conversionRate}</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{salesMetrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">3 ending this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    lead.status === 'hot' ? 'bg-red-500' :
                    lead.status === 'warm' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.contact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{lead.value}</p>
                  <Badge variant={lead.status === 'hot' ? 'destructive' : 
                                lead.status === 'warm' ? 'secondary' : 'outline'}>
                    {lead.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.clicks} clicks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{campaign.budget}</p>
                  <Badge variant={campaign.performance === 'high' ? 'default' : 'secondary'}>
                    {campaign.performance}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Email Campaign</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Phone className="h-6 w-6" />
              <span>Call Leads</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <PieChart className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Social Media</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesMarketingDashboard;