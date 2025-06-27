
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrincipalGradesManager from '@/components/dashboard/principal/PrincipalGradesManager';
import PrincipalBulkGradingInterface from '@/components/grading/PrincipalBulkGradingInterface';
import PrincipalGradingModule from '@/components/grading/PrincipalGradingModule';
import PrincipalGradeInputInterface from '@/components/grading/PrincipalGradeInputInterface';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { GraduationCap, ClipboardList, Plus, CheckCircle, Edit } from 'lucide-react';

const PrincipalGradesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('approval');
  const { schoolId } = useSchoolScopedData();

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No school context available for grade management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Grade Management Center
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comprehensive grade management including approvals, input, and summaries
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger 
                value="approval" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <CheckCircle className="h-4 w-4" />
                Grade Approvals
              </TabsTrigger>
              <TabsTrigger 
                value="input" 
                className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                <Edit className="h-4 w-4" />
                Grade Input
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                Bulk Entry
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
              >
                <ClipboardList className="h-4 w-4" />
                Grade Summary
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="approval" className="mt-0 p-6">
            <PrincipalGradesManager schoolId={schoolId} />
          </TabsContent>

          <TabsContent value="input" className="mt-0 p-6">
            <PrincipalGradeInputInterface />
          </TabsContent>

          <TabsContent value="bulk" className="mt-0 p-6">
            <PrincipalBulkGradingInterface />
          </TabsContent>

          <TabsContent value="summary" className="mt-0 p-6">
            <PrincipalGradingModule />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PrincipalGradesModule;
