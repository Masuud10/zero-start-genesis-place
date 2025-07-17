import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, MessageCircle, Calendar, FileText, Clock } from 'lucide-react';

const SupportHRDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support & HR Dashboard</h2>
          <p className="text-muted-foreground">Employee support, HR management, and internal communications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">-2 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Time off requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month Reviews</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Performance reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Latest employee support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'T-001', title: 'Password Reset Request', user: 'Sarah Johnson', priority: 'high', status: 'open' },
                  { id: 'T-002', title: 'Equipment Request', user: 'Mike Chen', priority: 'medium', status: 'in_progress' },
                  { id: 'T-003', title: 'Access Permission Issue', user: 'Emily Davis', priority: 'low', status: 'resolved' },
                ].map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user} • {ticket.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant={ticket.status === 'resolved' ? 'default' : 'outline'}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* HR Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>HR Quick Actions</CardTitle>
              <CardDescription>Common HR tasks and processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Employee Onboarding</span>
                  </div>
                  <Badge variant="outline">3 pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Off Requests</span>
                  </div>
                  <Badge variant="outline">5 pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Performance Reviews</span>
                  </div>
                  <Badge variant="outline">2 due</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Company Announcements</CardTitle>
            <CardDescription>Recent internal communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Q4 All-Hands Meeting Scheduled', date: '2024-01-15', type: 'meeting' },
                { title: 'New Health Benefits Package', date: '2024-01-12', type: 'benefits' },
                { title: 'Office Holiday Schedule Updated', date: '2024-01-10', type: 'policy' },
              ].map((announcement, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{announcement.date}</p>
                  </div>
                  <Badge variant="secondary">{announcement.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default SupportHRDashboard;