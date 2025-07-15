
import React, { useEffect, useState } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GradesBusinessLogic } from '@/services/GradesBusinessLogic';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Award, 
  AlertCircle, 
  Clock,
  BookOpen,
  Target
} from 'lucide-react';

interface GradesAdminSummaryProps {
  loading: boolean;
  error: string | null;
  gradesSummary: any;
  schools: Array<{ id: string; name: string }>;
  schoolFilter: string | null;
  setSchoolFilter: (filter: string | null) => void;
}

interface EnhancedGradesData {
  overall_average: number;
  total_grades: number;
  grade_distribution: {
    excellent: number;
    good: number;
    satisfactory: number;
    needs_improvement: number;
    failing: number;
  };
  subject_performance: Array<{
    subject_name: string;
    average_score: number;
    improvement_trend: 'up' | 'down' | 'stable';
    difficulty_index: number;
  }>;
  class_performance: Array<{
    class_name: string;
    average_percentage: number;
    student_count: number;
    top_student: string;
  }>;
  workflow_status: {
    pending_approval: number;
    approved: number;
    rejected: number;
    released: number;
    draft: number;
  };
  top_performers: Array<{
    student_name: string;
    overall_percentage: number;
    subject_count: number;
  }>;
  underperformers: Array<{
    student_name: string;
    overall_percentage: number;
    failing_subjects: number;
  }>;
}

const GradesAdminSummary: React.FC<GradesAdminSummaryProps> = ({
  loading,
  error,
  gradesSummary,
  schools,
  schoolFilter,
  setSchoolFilter,
}) => {
  const [enhancedData, setEnhancedData] = useState<EnhancedGradesData | null>(null);
  const [businessLogic, setBusinessLogic] = useState<GradesBusinessLogic | null>(null);
  const [insights, setInsights] = useState<{
    key_metrics: Record<string, number>;
    recommendations: string[];
    alerts: string[];
  } | null>(null);

  // Initialize business logic when school filter changes
  useEffect(() => {
    if (schoolFilter) {
      const logic = new GradesBusinessLogic(schoolFilter);
      setBusinessLogic(logic);
      
      // Load enhanced data
      logic.calculateGradesSummary()
        .then(data => setEnhancedData(data))
        .catch(err => console.error('Error loading enhanced grades data:', err));
      
      // Load insights
      logic.generateGradesInsights()
        .then(data => setInsights(data))
        .catch(err => console.error('Error loading grades insights:', err));
    } else {
      setBusinessLogic(null);
      setEnhancedData(null);
      setInsights(null);
    }
  }, [schoolFilter]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Grades Overview
          </h1>
          <p className="text-muted-foreground">
            View grade performance summaries across all schools.
          </p>
        </div>
        <SchoolSummaryFilter
          schools={schools}
          value={schoolFilter}
          onChange={setSchoolFilter}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {loading ? (
          <Card><CardContent>Loading summary...</CardContent></Card>
        ) : error ? (
          <Card><CardContent className="text-red-500">{error}</CardContent></Card>
        ) : enhancedData ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getGradeColor(enhancedData.overall_average)}`}>
                  {enhancedData.overall_average}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {enhancedData.total_grades} total grades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {enhancedData.top_performers.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students ≥85%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Need Support</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {enhancedData.underperformers.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Students &lt;60%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {enhancedData.workflow_status.pending_approval}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Released</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {enhancedData.workflow_status.released}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available to parents
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent>No summary data found.</CardContent></Card>
        )}
      </div>

      {/* Grade Distribution Chart */}
      {enhancedData && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Excellent (A: 80-100%)</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(enhancedData.grade_distribution.excellent / enhancedData.total_grades) * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-green-600 font-medium">
                    {enhancedData.grade_distribution.excellent}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Good (B: 70-79%)</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(enhancedData.grade_distribution.good / enhancedData.total_grades) * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-blue-600 font-medium">
                    {enhancedData.grade_distribution.good}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Satisfactory (C: 60-69%)</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(enhancedData.grade_distribution.satisfactory / enhancedData.total_grades) * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-yellow-600 font-medium">
                    {enhancedData.grade_distribution.satisfactory}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Needs Improvement (D: 40-59%)</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(enhancedData.grade_distribution.needs_improvement / enhancedData.total_grades) * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-orange-600 font-medium">
                    {enhancedData.grade_distribution.needs_improvement}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failing (F: 0-39%)</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(enhancedData.grade_distribution.failing / enhancedData.total_grades) * 100} 
                    className="w-32"
                  />
                  <span className="text-sm text-red-600 font-medium">
                    {enhancedData.grade_distribution.failing}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Performance Analysis */}
      {enhancedData && enhancedData.subject_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedData.subject_performance.slice(0, 6).map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{subject.subject_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Difficulty index: {Math.round(subject.difficulty_index * 100)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-bold text-lg ${getGradeColor(subject.average_score)}`}>
                        {subject.average_score}%
                      </div>
                    </div>
                    {getTrendIcon(subject.improvement_trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Performance Summary */}
      {enhancedData && enhancedData.class_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedData.class_performance.slice(0, 5).map((classData, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{classData.class_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {classData.student_count} students • Top: {classData.top_student}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getGradeColor(classData.average_percentage)}`}>
                      {classData.average_percentage}%
                    </div>
                    <Badge 
                      variant={classData.average_percentage >= 80 ? "default" : classData.average_percentage >= 70 ? "secondary" : "destructive"}
                    >
                      {classData.average_percentage >= 80 ? "Excellent" : classData.average_percentage >= 70 ? "Good" : "Needs Focus"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights and Alerts */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.alerts.map((alert, index) => (
                    <li key={index} className="text-sm flex items-start gap-2 text-red-600">
                      <span className="mt-1">⚠</span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesAdminSummary;
