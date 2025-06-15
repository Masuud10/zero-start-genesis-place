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
      <FinanceAdminSummary
        loading={loading}
        error={error}
        financeSummary={financeSummary}
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
