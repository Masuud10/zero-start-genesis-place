import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParentGrades } from '@/hooks/useParentGrades';
import { GraduationCap, User, TrendingUp, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ParentGradesView: React.FC = () => {
  const { data: childrenData, isLoading, error } = useParentGrades();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Children's Grades</h1>
          <p className="text-muted-foreground">View your children's academic performance</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Children's Grades</h1>
          <p className="text-muted-foreground">View your children's academic performance</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading grades: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!childrenData || childrenData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Children's Grades</h1>
          <p className="text-muted-foreground">View your children's academic performance</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No children found in your account.</p>
              <p>Please contact the school administration to link your children to your parent account.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Children's Grades</h1>
        <p className="text-muted-foreground">View your children's academic performance</p>
      </div>

      <div className="space-y-6">
        {childrenData.map((child) => (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {child.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {child.grades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No released grades available for {child.name}</p>
                  <p className="text-sm">Grades will appear here when teachers release them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {child.grades.map((grade) => (
                      <Card key={grade.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {grade.subject?.name || 'Unknown Subject'}
                            </CardTitle>
                            <Badge variant="outline">
                              {grade.letter_grade}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Score:</span>
                              <span className="font-medium">
                                {grade.score}/{grade.max_score} ({grade.percentage}%)
                              </span>
                            </div>
                            {grade.position && (
                              <div className="flex justify-between">
                                <span>Position:</span>
                                <span className="font-medium flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  #{grade.position}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Term:</span>
                              <span className="font-medium">{grade.term}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Exam:</span>
                              <span className="font-medium">{grade.exam_type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Class:</span>
                              <span className="font-medium">{grade.class?.name}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParentGradesView;