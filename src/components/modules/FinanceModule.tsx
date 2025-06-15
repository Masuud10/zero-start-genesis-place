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
import FinanceAdminSummary from './FinanceAdminSummary';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
    setLoading(true);
    supabase.from("schools")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) setError("Failed to fetch schools list. Please try again later.");
        else setSchools(data || []);
        setLoading(false);
      });
  }, [isEdufamAdmin]);

  // Fetch summary from view only (no details)
  useEffect(() => {
    if (!isEdufamAdmin) return;
    setLoading(true);
    setError(null);
    let query = (supabase as any)
      .from("school_finance_summary")
      .select("*");
    if (schoolFilter) {
      query = query.eq("school_id", schoolFilter);
    }
    query.then(({ data, error }: any) => {
      if (error) {
        setError("Could not load financial summary data. Please try again shortly.");
        setFinanceSummary(null);
      } else if (!data || data.length === 0) {
        setFinanceSummary(null);
      } else {
        setFinanceSummary(data[0]);
      }
      setLoading(false);
    });
  }, [isEdufamAdmin, schoolFilter]);

  if (isEdufamAdmin) {
    if (loading) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      );
    }
    if (!financeSummary) {
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>
            There is no financial summary available for this school or filter. Try selecting a different school or check back later.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <FinanceAdminSummary
        loading={loading}
        error={null}
        financeSummary={{
          total_collected: financeSummary.total_collected ?? 0,
          outstanding: '—',
          major_expenses: '—'
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
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
