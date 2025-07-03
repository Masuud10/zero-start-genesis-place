import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface RoleReportDownloadButtonProps {
  userRole?: string;
  label?: string;
  type?: string;
  term?: string;
}

const RoleReportDownloadButton: React.FC<RoleReportDownloadButtonProps> = ({ 
  userRole = '', 
  label = 'Download Report' 
}) => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <Button onClick={handleDownload} size="sm" variant="outline">
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default RoleReportDownloadButton;