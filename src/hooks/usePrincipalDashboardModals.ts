
import { useState } from 'react';

export const usePrincipalDashboardModals = () => {
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addParentOpen, setAddParentOpen] = useState(false);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [bulkGradingOpen, setBulkGradingOpen] = useState(false);

  return {
    addTeacherOpen,
    setAddTeacherOpen,
    addParentOpen,
    setAddParentOpen,
    addClassOpen,
    setAddClassOpen,
    addSubjectOpen,
    setAddSubjectOpen,
    bulkGradingOpen,
    setBulkGradingOpen,
  };
};
