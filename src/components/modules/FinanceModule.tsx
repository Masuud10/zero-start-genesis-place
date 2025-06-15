import React, { useState, useEffect } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, FileText, Plus, Download, CreditCard } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DownloadReportButton from "@/components/reports/DownloadReportButton";

interface FeeRecord {
  id: string;
  student_id: string;
  amount: number;
  paid_amount: number;
  category: string;
  status: string;
  due_date: string;
  student?: {
    name: string;
    admission_number: string;
    class_id: string;
  };
  className?: string;
}

const FinanceModule: React.FC = () => {
  const { user } = useAuth();
  const isEdufamAdmin = user?.role === 'edufam_admin';

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdufamAdmin) return;
    supabase.from("schools")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) setError("Could not fetch schools");
        else setSchools(data || []);
      });
  }, [isEdufamAdmin]);

  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query;
    if (schoolFilter) {
      query = (supabase.rpc as any)('get_finance_summary', { school_id: schoolFilter });
    } else {
      query = (supabase.rpc as any)('get_finance_summary');
    }
    query.then(({ data, error }: any) => {
      if (error) setError("Failed to fetch financial summary");
      setFinanceSummary(data || null);
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  if (isEdufamAdmin) {
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
  }

  // For non-Edufam admin: hide everything (fix errors!)
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold">You do not have permission to view this page.</h2>
    </div>
  );
};

export default FinanceModule;
