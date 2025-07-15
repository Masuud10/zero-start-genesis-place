import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Building2, Eye, EyeOff } from 'lucide-react';

const SystemAnalyticsPage: React.FC = () => {
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

  const toggleDetailedAnalytics = () => {
    setShowDetailedAnalytics(!showDetailedAnalytics);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Monitor system-wide performance and usage</p>
        </div>
        <Button onClick={toggleDetailedAnalytics} variant="outline">
          {showDetailedAnalytics ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Detailed Analytics
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,249</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.5%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processing</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">Records processed</p>
          </CardContent>
        </Card>
      </div>

      {showDetailedAnalytics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-4">School Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average Student Enrollment</span>
                      <span className="font-semibold">245 students</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Attendance Rate</span>
                      <span className="font-semibold">87.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee Collection Rate</span>
                      <span className="font-semibold">92.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grade Approval Efficiency</span>
                      <span className="font-semibold">96.1%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">System Usage Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Daily Active Users</span>
                      <span className="font-semibold">3,420</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Usage Hours</span>
                      <span className="font-semibold">8AM - 12PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mobile vs Desktop</span>
                      <span className="font-semibold">65% / 35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Session Duration</span>
                      <span className="font-semibold">24 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Detailed regional analytics charts will be displayed here.</p>
                <p>Interactive maps and demographic breakdowns coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemAnalyticsPage;