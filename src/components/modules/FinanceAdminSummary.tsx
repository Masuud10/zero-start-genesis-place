
import React from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FinanceAdminSummaryProps {
  loading: boolean;
  error: string | null;
  financeSummary: any;
  schools: Array<{ id: string; name: string }>;
  schoolFilter: string | null;
  setSchoolFilter: (filter: string | null) => void;
}

const FinanceAdminSummary: React.FC<FinanceAdminSummaryProps> = ({
  loading,
  error,
  financeSummary,
  schools,
  schoolFilter,
  setSchoolFilter
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Finance Overview
          </h1>
          <p className="text-muted-foreground">
            View financial summaries across all schools.
          </p>
        </div>
        <SchoolSummaryFilter
          schools={schools}
          value={schoolFilter}
          onChange={setSchoolFilter}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <Card><CardContent>Loading summary...</CardContent></Card>
        ) : error ? (
          <Card><CardContent className="text-red-500">{error}</CardContent></Card>
        ) : financeSummary ? (
          <>
            <Card>
              <CardHeader><CardTitle>Total Fee Collections</CardTitle></CardHeader>
              <CardContent>
                <div className="font-bold text-xl">
                  {financeSummary.total_collected !== undefined ? `KES ${Number(financeSummary.total_collected).toLocaleString()}` : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Outstanding Fees</CardTitle></CardHeader>
              <CardContent>
                <div>
                  {financeSummary.outstanding !== undefined ? `KES ${Number(financeSummary.outstanding).toLocaleString()}` : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Major Expense Categories</CardTitle></CardHeader>
              <CardContent>
                <div>
                  {financeSummary.major_expenses || 'N/A'}
                </div>
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

export default FinanceAdminSummary;
