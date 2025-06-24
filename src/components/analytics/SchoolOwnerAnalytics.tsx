
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { usePrincipalDashboardData } from '@/hooks/usePrincipalDashboardData';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Loader2, AlertCircle, Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SchoolOwnerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const SchoolOwnerAnalytics = ({ filters }: SchoolOwnerAnalyticsProps) => {
  const { schoolId } = useSchoolScopedData();
  const { stats, loading: principalLoading, error: principalError } = usePrincipalDashboardData(0);
  const { data: financeData, isLoading: financeLoading, error: financeError } = useFinanceOfficerAnalytics(filters);
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData(schoolId);

  const loading = principalLoading || financeLoading || analyticsLoading;
  const error = principalError || financeError || analyticsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading school analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load school analytics. Please try again later.
          <br />
          <small>{typeof error === 'string' ? error : error?.message}</small>
        </AlertDescription>
      </Alert>
    );
  }

  const chartConfig = {
    students: { label: 'Students', color: '#3b82f6' },
    teachers: { label: 'Teachers', color: '#10b981' },
    revenue: { label: 'Revenue', color: '#8b5cf6' },
    collection: { label: 'Collection Rate', color: '#f59e0b' },
  };

  // Prepare chart data from real stats
  const schoolOverviewData = [
    { category: 'Students', count: stats.totalStudents, target: stats.totalStudents + 20 },
    { category: 'Teachers', count: stats.totalTeachers, target: stats.totalTeachers + 5 },
    { category: 'Classes', count: stats.totalClasses, target: stats.totalClasses + 2 },
    { category: 'Subjects', count: stats.totalSubjects, target: stats.totalSubjects + 3 },
  ];

  const feeCollectionTrend = financeData?.feeCollectionData?.map(item => ({
    class: item.class,
    collected: item.collected,
    expected: item.expected,
    rate: item.expected > 0 ? (item.collected / item.expected) * 100 : 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Fee Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financeData?.keyMetrics?.collectionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              KES {financeData?.keyMetrics?.totalCollected?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total collected</p>
          </CardContent>
        </Card>
      </div>

      {/* School Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>School Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {schoolOverviewData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={schoolOverviewData}>
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-students)" name="Current" />
                <Bar dataKey="target" fill="var(--color-teachers)" name="Target" opacity={0.5} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No school overview data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection by Class */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection by Class</CardTitle>
          </CardHeader>
          <CardContent>
            {feeCollectionTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={feeCollectionTrend}>
                  <XAxis dataKey="class" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="collected" fill="var(--color-collection)" name="Collected (KES)" />
                  <Bar dataKey="expected" fill="#ef4444" name="Expected (KES)" opacity={0.5} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No fee collection data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {financeData?.dailyTransactions && financeData.dailyTransactions.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={financeData.dailyTransactions.slice(-7)}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--color-revenue)" 
                    strokeWidth={2}
                    name="Amount (KES)"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No transaction trends available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>School Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Academic Performance</h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Classes: {stats.totalClasses}</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Subjects: {stats.totalSubjects}</span>
                  <Badge variant="default">Active</Badge>
                </div>
                {analytics && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Avg Grade: {analytics.averageGrade.toFixed(1)}%</span>
                    <Badge variant={analytics.averageGrade > 75 ? 'default' : 'secondary'}>
                      {analytics.averageGrade > 75 ? 'Good' : 'Fair'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Financial Health</h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collection Rate</span>
                  <Badge variant={financeData?.keyMetrics?.collectionRate > 80 ? 'default' : 'destructive'}>
                    {financeData?.keyMetrics?.collectionRate?.toFixed(1) || 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Outstanding</span>
                  <span className="text-sm">KES {financeData?.keyMetrics?.outstandingAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Staff Overview</h4>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Teachers</span>
                  <span className="font-medium">{stats.totalTeachers}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">Student-Teacher Ratio</span>
                  <span className="font-medium">
                    {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
                  </span>
                </div>
                {analytics && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Attendance: {analytics.attendanceRate.toFixed(1)}%</span>
                    <Badge variant={analytics.attendanceRate > 85 ? 'default' : 'secondary'}>
                      {analytics.attendanceRate > 85 ? 'Good' : 'Fair'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerAnalytics;
