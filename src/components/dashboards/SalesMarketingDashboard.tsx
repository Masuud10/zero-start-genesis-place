import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Mail, Calendar, Target, Megaphone } from "lucide-react";

const SalesMarketingDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {adminUser?.name}. Here's your marketing overview.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          Sales & Marketing
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active prospects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Marketing Analytics
            </CardTitle>
            <CardDescription>
              Track marketing performance and ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Marketing analytics dashboard coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Campaign Management</li>
                  <li>• Lead Tracking</li>
                  <li>• Event Planning</li>
                  <li>• Performance Analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Management
            </CardTitle>
            <CardDescription>
              Manage prospects and conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Lead management system coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Lead Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Prospect Tracking</li>
                  <li>• Follow-up Management</li>
                  <li>• Conversion Analytics</li>
                  <li>• Sales Pipeline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesMarketingDashboard;