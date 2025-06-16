
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      <div className="bg-white/90 p-6 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">School Management</h1>
        <p className="text-gray-600">Manage all aspects of your school operations from this central hub.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="academic-periods">Academic Periods</TabsTrigger>
          <TabsTrigger value="current-settings">Current Settings</TabsTrigger>
          <TabsTrigger value="classes">Class Management</TabsTrigger>
          <TabsTrigger value="subjects">Subject Management</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Assignment</TabsTrigger>
          <TabsTrigger value="students">Student & Parent Management</TabsTrigger>
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
    </div>
  );
};

export default SchoolManagementDashboard;
