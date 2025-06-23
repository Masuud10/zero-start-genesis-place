
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrincipalGradesManager from '@/components/dashboard/principal/PrincipalGradesManager';
import PrincipalBulkGradingInterface from '@/components/grading/PrincipalBulkGradingInterface';
import PrincipalGradingModule from '@/components/grading/PrincipalGradingModule';
import { GraduationCap, ClipboardList, Plus, CheckCircle } from 'lucide-react';

const PrincipalGradesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('approval');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Grade Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="approval" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <CheckCircle className="h-4 w-4" />
                Grade Approvals
              </TabsTrigger>
              <TabsTrigger 
                value="entry" 
                className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                <Plus className="h-4 w-4" />
                Grade Entry
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                <ClipboardList className="h-4 w-4" />
                Grade Summary
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="approval" className="mt-0 p-6">
            <PrincipalGradesManager />
          </TabsContent>

          <TabsContent value="entry" className="mt-0 p-6">
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
