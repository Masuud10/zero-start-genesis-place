
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import StudentAdmissionModal from "@/components/modals/StudentAdmissionModal";
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { useStudents } from "@/hooks/useStudents";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StudentParentManagementTab = () => {
  return (
    <div>
      <div className="font-semibold text-lg mb-2">Student and Parent Management</div>
      <p className="mb-4 text-muted-foreground">This feature has been moved to the main Students section for better organization.</p>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Student admission and parent management is now available in the Students section of the sidebar.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StudentParentManagementTab;
