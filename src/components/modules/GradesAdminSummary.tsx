
import React from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface GradesAdminSummaryProps {
  loading: boolean;
  error: string | null;
  gradesSummary: any;
  schools: Array<{ id: string; name: string }>;
  schoolFilter: string | null;
  setSchoolFilter: (filter: string | null) => void;
}

const GradesAdminSummary: React.FC<GradesAdminSummaryProps> = ({
  loading,
  error,
  gradesSummary,
  schools,
  schoolFilter,
  setSchoolFilter,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Grades Overview
          </h1>
          <p className="text-muted-foreground">
            View grade performance summaries across all schools.
          </p>
        </div>
        <SchoolSummaryFilter
          schools={schools}
          value={schoolFilter}
          onChange={setSchoolFilter}
        />
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <Card><CardContent>Loading summary...</CardContent></Card>
        ) : error ? (
          <Card><CardContent className="text-red-500">{error}</CardContent></Card>
        ) : gradesSummary ? (
          <>
            <Card>
              <CardHeader><CardTitle>Average Grade</CardTitle></CardHeader>
              <CardContent>
                <div className="font-bold text-xl">
                  {gradesSummary.avg_grade ? `${gradesSummary.avg_grade}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Most Improved School</CardTitle></CardHeader>
              <CardContent>
                <div>{gradesSummary.most_improved_school || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Declining Performance Alerts</CardTitle></CardHeader>
              <CardContent>
                <div>{gradesSummary.declining_alerts || 0}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent>No summary data found.</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default GradesAdminSummary;
