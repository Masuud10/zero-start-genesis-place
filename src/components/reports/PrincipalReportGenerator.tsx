import React from 'react';
import PrincipalReportsModule from './PrincipalReportsModule';

interface PrincipalReportGeneratorProps {
  onClose?: () => void;
  onReportGenerated?: (message?: string) => void;
  open?: boolean;
}

const PrincipalReportGenerator: React.FC<PrincipalReportGeneratorProps> = () => {
  return <PrincipalReportsModule />;
};

export default PrincipalReportGenerator;