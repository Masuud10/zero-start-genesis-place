import React from 'react';
import { SchoolInfo } from '@/types/report';

interface ReportHeaderProps {
  schoolInfo: SchoolInfo;
  title: string;
  generatedAt: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ schoolInfo, title, generatedAt }) => {
  return (
    <div className="border-b border-border pb-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {schoolInfo.logo && (
            <img src={schoolInfo.logo} alt="School Logo" className="h-16 w-16 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{schoolInfo.name}</h1>
            {schoolInfo.address && (
              <p className="text-sm text-muted-foreground">{schoolInfo.address}</p>
            )}
            <div className="flex space-x-4 text-sm text-muted-foreground">
              {schoolInfo.phone && <span>📞 {schoolInfo.phone}</span>}
              {schoolInfo.email && <span>✉️ {schoolInfo.email}</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;