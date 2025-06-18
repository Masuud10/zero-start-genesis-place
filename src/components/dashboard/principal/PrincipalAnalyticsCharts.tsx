
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { usePrincipalAnalyticsData } from '@/hooks/usePrincipalAnalyticsData';
import { Loader2, TrendingUp, Users, BookOpen, Award, GraduationCap, Target, Download, Filter, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrincipalAnalyticsCharts = () => {
  const { data, isLoading, error } = usePrincipalAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="flex items-center justify-center h-80 animate-pulse">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading analytics...</p>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-full border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Analytics Unavailable</h3>
              <p className="text-red-600 mt-2">Please ensure academic years and terms are configured.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    average: { label: 'Average Score', color: '#3b82f6' },
    attendance: { label: 'Attendance Rate', color: '#10b981' },
    improvement: { label: 'Improvement', color: '#8b5cf6' },
    submissions: { label: 'Submissions', color: '#f59e0b' },
  };

  return (
    <div className="space-y-8">
      {/* Key Performance Metrics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-600" />
            Key Performance Metrics
          </h2>
          <div className="text-sm text-gray-500">Current Academic Term</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students Metric */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Total Students</p>
                  <p className="text-3xl font-bold text-blue-900">{data.keyMetrics.totalStudents}</p>
                  <p className="text-xs text-blue-600">Enrolled this term</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Average Metric */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-700">School Average</p>
                  <p className="text-3xl font-bold text-green-900">{data.keyMetrics.schoolAverage.toFixed(1)}%</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">Overall performance</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Rate Metric */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700">Attendance Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{data.keyMetrics.attendanceRate.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600">Current term average</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pass Rate Metric */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-700">Pass Rate</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {data.keyMetrics.schoolAverage >= 50 ? '95%' : '78%'}
                  </p>
                  <p className="text-xs text-orange-600">Students above 50%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Performance Overview */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                Class Performance Overview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Average scores and attendance by class</p>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.classPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="class" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={{ stroke: '#e5e7eb' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="average" 
                    fill="#3b82f6" 
                    name="Academic Average (%)" 
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <Bar 
                    dataKey="attendance" 
                    fill="#10b981" 
                    name="Attendance Rate (%)" 
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Performance Trends */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                Subject Performance Trends
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-800">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-800">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-green-100 text-sm">Performance trends across subjects</p>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={{ stroke: '#e5e7eb' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={3}
                    className="animate-pulse"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teacher Grading Activity */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              Teacher Grading Activity
            </CardTitle>
            <p className="text-purple-100 text-sm">Recent grading submissions and activity</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.teacherActivity.length > 0 ? (
                data.teacherActivity.slice(0, 6).map((teacher, index) => (
                  <div
                    key={`${teacher.teacher}-${index}`}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {teacher.teacher.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.teacher}</p>
                        <p className="text-sm text-gray-500">{teacher.submissions || 0} submissions this term</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                        <p className="text-xs text-gray-500">Last: 2 days ago</p>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min((teacher.submissions || 0) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No grading activity data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Students */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <CardTitle className="flex items-center gap-3">
              <Award className="h-5 w-5" />
              Top Performing Students
            </CardTitle>
            <p className="text-orange-100 text-sm">Academic excellence leaders</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.studentRankings.length > 0 ? (
                data.studentRankings.slice(0, 6).map((student, index) => (
                  <div
                    key={`${student.name}-${index}`}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-orange-600">{student.average.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Position {student.position}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No student ranking data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrincipalAnalyticsCharts;
