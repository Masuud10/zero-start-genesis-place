
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, School, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import ReportExporter from './ReportExporter';
import { useQuery } from '@tanstack/react-query';
import { ReportEnhancementService } from '@/services/system/reportEnhancementService';

const EduFamSystemAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch system metrics
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => ReportEnhancementService.getSystemMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch financial data
  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => ReportEnhancementService.getFinancialSummary(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch user metrics
  const { data: userMetrics, isLoading: userLoading } = useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => ReportEnhancementService.getUserEngagementMetrics(),
    refetchInterval: 60000, // Refresh every minute
  });

  const isLoading = metricsLoading || financialLoading || userLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">EduFam System Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive system overview and performance metrics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : systemMetrics?.totalSchools || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active educational institutions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : systemMetrics?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered platform users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : `${systemMetrics?.systemUptime || 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  System availability
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : systemMetrics?.openTickets || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Open support requests
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Database
                  </Badge>
                  <span className="text-sm text-muted-foreground">Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Authentication
                  </Badge>
                  <span className="text-sm text-muted-foreground">Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reports
                  </Badge>
                  <span className="text-sm text-muted-foreground">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Active Schools</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {isLoading ? '...' : systemMetrics?.activeSchools || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Currently operational schools
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Support Resolution Rate</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {isLoading ? '...' : `${systemMetrics?.ticketResolutionRate || 0}%`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average ticket resolution efficiency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  KES {isLoading ? '...' : financialData?.totalFeesCollected?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total fees collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  KES {isLoading ? '...' : financialData?.outstandingFees?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending collections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : `${financialData?.collectionRate || 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment efficiency
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EduFamSystemAnalytics;
