
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Calendar, Users, BookOpen, UserCheck, GraduationCap } from 'lucide-react';
import AcademicSettings from './AcademicSettings';
import ClassManagementTab from "./management/ClassManagementTab";
import SubjectManagementTab from "./management/SubjectManagementTab";
import TeacherAssignmentTab from "./management/TeacherAssignmentTab";
import StudentParentManagementTab from "./management/StudentParentManagementTab";
import AcademicYearTermManagement from './AcademicYearTermManagement';

const SchoolManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("academic-periods");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            School Management Center
          </CardTitle>
          <p className="text-gray-600 ml-13">
            Centralized hub for managing all aspects of your school operations, from academic periods to staff assignments.
          </p>
        </CardHeader>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Academic Management</p>
                <p className="text-xs text-green-500">Years & Terms Setup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Class & Subject Setup</p>
                <p className="text-xs text-purple-500">Academic Structure</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Staff & Students</p>
                <p className="text-xs text-orange-500">Personnel Management</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-6">
              <TabsTrigger value="academic-periods" className="text-xs lg:text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Academic Periods
              </TabsTrigger>
              <TabsTrigger value="current-settings" className="text-xs lg:text-sm">
                <School className="w-4 h-4 mr-2" />
                Current Settings
              </TabsTrigger>
              <TabsTrigger value="classes" className="text-xs lg:text-sm">
                <GraduationCap className="w-4 h-4 mr-2" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs lg:text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Subjects
              </TabsTrigger>
              <TabsTrigger value="teachers" className="text-xs lg:text-sm">
                <UserCheck className="w-4 h-4 mr-2" />
                Teachers
              </TabsTrigger>
              <TabsTrigger value="students" className="text-xs lg:text-sm">
                <Users className="w-4 h-4 mr-2" />
                Students
              </TabsTrigger>
            </TabsList>

            <TabsContent value="academic-periods">
              <AcademicYearTermManagement />
            </TabsContent>

            <TabsContent value="current-settings">
              <AcademicSettings />
            </TabsContent>

            <TabsContent value="classes">
              <ClassManagementTab />
            </TabsContent>

            <TabsContent value="subjects">
              <SubjectManagementTab />
            </TabsContent>

            <TabsContent value="teachers">
              <TeacherAssignmentTab />
            </TabsContent>

            <TabsContent value="students">
              <StudentParentManagementTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolManagementDashboard;
