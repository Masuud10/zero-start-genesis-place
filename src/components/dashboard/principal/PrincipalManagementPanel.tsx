
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClassManagementTab from "./management/ClassManagementTab";
import SubjectManagementTab from "./management/SubjectManagementTab";
import TeacherAssignmentTab from "./management/TeacherAssignmentTab";
import StudentParentManagementTab from "./management/StudentParentManagementTab";

// Main management panel with four tabs
const PrincipalManagementPanel = () => {
  const [tab, setTab] = useState("classes");

  return (
    <div className="bg-white/90 p-6 rounded-lg border border-gray-200 my-8">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex">
          <TabsTrigger value="classes">Class Management</TabsTrigger>
          <TabsTrigger value="subjects">Subject Management</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Assignment</TabsTrigger>
          <TabsTrigger value="students">Student & Parent Management</TabsTrigger>
        </TabsList>
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

export default PrincipalManagementPanel;
