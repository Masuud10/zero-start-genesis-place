
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useParentChildrenGrades } from '@/hooks/useParentChildrenGrades';

const ChildrenGradesSection: React.FC = () => {
  const { childrenGrades, loading, error } = useParentChildrenGrades();

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 50) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Children's Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading grades...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Children's Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (childrenGrades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Children's Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No released grades found for your children at the moment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Children's Grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {childrenGrades.map((child) => (
            <div key={child.student_id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{child.student_name}</h3>
                  <p className="text-sm text-muted-foreground">{child.class_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(child.average_score)}
                  <Badge className={getGradeColor(child.average_score)}>
                    {child.average_score > 0 ? `${child.average_score.toFixed(1)}% Average` : 'No grades yet'}
                  </Badge>
                </div>
              </div>

              {child.recent_grades.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Recent Grades ({child.total_subjects} subjects)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {child.recent_grades.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{grade.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {grade.term} - {grade.exam_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {grade.score}/{grade.max_score}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {grade.letter_grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No grades available yet</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildrenGradesSection;
