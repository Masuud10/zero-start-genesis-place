
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock, Target } from 'lucide-react';
import { Subject } from '@/types/subject';

interface SubjectsListProps {
  subjects: Subject[];
  loading?: boolean;
}

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subjects Created</h3>
          <p className="text-gray-600">
            Start by creating your first subject using the "Create Subject" button above.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCurriculumColor = (curriculum: string) => {
    switch (curriculum.toLowerCase()) {
      case 'cbc':
        return 'bg-green-100 text-green-800';
      case 'igcse':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'core':
        return 'bg-red-100 text-red-800';
      case 'elective':
        return 'bg-yellow-100 text-yellow-800';
      case 'optional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card key={subject.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {subject.name}
                </CardTitle>
                <p className="text-sm text-gray-600 font-mono">
                  {subject.code}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={getCurriculumColor(subject.curriculum || 'cbc')}>
                  {(subject.curriculum || 'CBC').toUpperCase()}
                </Badge>
                <Badge className={getCategoryColor(subject.category || 'core')}>
                  {(subject.category || 'Core').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {subject.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {subject.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {subject.credit_hours || 1} {subject.credit_hours === 1 ? 'Hour' : 'Hours'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {subject.assessment_weight || 100}%
                </span>
              </div>
            </div>

            {(subject.class_id || subject.teacher_id) && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                {subject.class_id && (
                  <p className="text-xs text-gray-600">
                    <Users className="w-3 h-3 inline mr-1" />
                    Class: {subject.class?.name || 'Unknown Class'}
                  </p>
                )}
                {subject.teacher_id && (
                  <p className="text-xs text-gray-600">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    Teacher: {subject.teacher?.name || 'Unknown Teacher'}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                subject.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {subject.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                Created {new Date(subject.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubjectsList;
