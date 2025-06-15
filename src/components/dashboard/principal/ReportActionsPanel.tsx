
import React from "react";
import RoleReportDownloadButton from '@/components/reports/RoleReportDownloadButton';
import AcademicReportPanel from './AcademicReportPanel';

interface ReportActionsPanelProps {
  downloadingReport: boolean;
  setDownloadingReport: (val: boolean) => void;
  user: any;
  schoolId: string | undefined;
  toast: any;
}

const ReportActionsPanel: React.FC<ReportActionsPanelProps> = ({
  downloadingReport,
  setDownloadingReport,
  user,
  schoolId,
  toast,
}) => (
  <div className="mb-2 flex flex-col gap-2">
    <RoleReportDownloadButton
      type="grades"
      term={"" + (new Date().getFullYear())}
      label="Download Grades (Excel)"
    />
    <RoleReportDownloadButton
      type="attendance"
      term={"" + (new Date().getFullYear())}
      label="Download Attendance (Excel)"
    />
    <AcademicReportPanel
      downloadingReport={downloadingReport}
      setDownloadingReport={setDownloadingReport}
      user={user}
      schoolId={schoolId}
      toast={toast}
    />
  </div>
);

export default ReportActionsPanel;
