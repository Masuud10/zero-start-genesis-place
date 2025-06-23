
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface EnhancedAnalyticsChartsProps {
  schoolId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const chartConfig = {
  average: { label: 'Average', color: '#3b82f6' },
  attendance: { label: 'Attendance Rate', color: '#10b981' },
  collection: { label: 'Collection Rate', color: '#8b5cf6' },
  students: { label: 'Students', color: '#f59e0b' },
};

export const EnhancedAnalyticsCharts: React.FC<EnhancedAnalyticsChartsProps> = ({ schoolId }) => {
  const { data: analytics, isLoading, error } = useAnalyticsData(schoolId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.averageGrade.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.averageGrade >= 75 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : analytics.averageGrade >= 60 ? (
                <Minus className="h-3 w-3 text-yellow-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              Performance trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.feeCollectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Collection rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.academicPerformance.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={analytics.academicPerformance}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="var(--color-average)" name="Average Score" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No academic performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.monthlyAttendance.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={analytics.monthlyAttendance}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="var(--color-attendance)" 
                    strokeWidth={2}
                    name="Attendance Rate"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No attendance trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.gradeDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <PieChart>
                  <Pie
                    data={analytics.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No grade distribution data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Expected</span>
                <span className="font-medium">KES {analytics.feeCollection.expected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Collected</span>
                <span className="font-medium text-green-600">KES {analytics.feeCollection.collected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Outstanding</span>
                <span className="font-medium text-red-600">KES {analytics.feeCollection.outstanding.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${analytics.feeCollectionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">{analytics.feeCollectionRate.toFixed(1)}% collected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsCharts;
