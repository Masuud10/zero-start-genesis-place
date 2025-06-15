
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import StudentAdmissionModal from "@/components/modals/StudentAdmissionModal";
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { useStudents } from "@/hooks/useStudents";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const StudentParentManagementTab = () => {
  const [isAdmitModalOpen, setAdmitModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const {
    classList,
    parentList,
    loading: loadingEntities,
    error: errorEntities,
  } = usePrincipalEntityLists(reloadKey);
  
  const { retry: retryStudents } = useStudents();

  const handleAdmissionSuccess = () => {
    setAdmitModalOpen(false);
    setReloadKey(k => k + 1);
    retryStudents();
  };
  
  return (
    <div>
      <div className="font-semibold text-lg mb-2">Student and Parent Management</div>
      <p className="mb-4 text-muted-foreground">This section allows you to enroll new students, assign them to classes, and link them to their parents.</p>
      
      {errorEntities && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading data needed for student admission: {errorEntities}
          </AlertDescription>
        </Alert>
      )}
      
      <Button onClick={() => setAdmitModalOpen(true)} disabled={loadingEntities || !!errorEntities}>
        Admit New Student
      </Button>
      
      <StudentAdmissionModal
        open={isAdmitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        onSuccess={handleAdmissionSuccess}
        classes={classList}
        parents={parentList}
        loadingParents={loadingEntities}
      />
    </div>
  );
};

export default StudentParentManagementTab;
