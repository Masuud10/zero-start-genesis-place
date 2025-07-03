import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { Eye, CheckCircle, AlertTriangle, Clock, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrincipalGradesSectionProps {
  schoolId: string;
  onModalOpen?: (modalType: string) => void;
}

const PrincipalGradesSection: React.FC<PrincipalGradesSectionProps> = ({
  schoolId,
  onModalOpen
}) => {
  const navigate = useNavigate();
  const { grades, isLoading } = usePrincipalGradeManagement();

  const pendingGrades = grades.filter(g => g.status === 'submitted');
  const approvedGrades = grades.filter(g => g.status === 'approved');
  const releasedGrades = grades.filter(g => g.status === 'released');

  const handleViewGrades = () => {
    navigate('/grades');
  };

  return (
    <section className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Grade Management Overview</h2>
      
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewGrades}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Grades Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? '...' : pendingGrades.length}
              </div>
              <p className="text-sm text-orange-700">Pending Review</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : approvedGrades.length}
              </div>
              <p className="text-sm text-green-700">Approved</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : releasedGrades.length}
              </div>
              <p className="text-sm text-blue-700">Released to Parents</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={handleViewGrades}
              className="w-full"
            >
              Manage All Grades
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default PrincipalGradesSection;