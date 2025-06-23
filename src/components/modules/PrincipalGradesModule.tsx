
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            Grade Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, and manage student grades across all classes.
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
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

            <TabsContent value="approval" className="mt-0">
              <PrincipalGradesManager />
            </TabsContent>

            <TabsContent value="entry" className="mt-0">
              <div className="p-6">
                <PrincipalBulkGradingInterface />
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <div className="p-6">
                <PrincipalGradingModule />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalGradesModule;
