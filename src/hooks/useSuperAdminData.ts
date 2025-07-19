import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  schools: {
    total: number;
    active: number;
    growth: number;
  };
  users: {
    total: number;
    students: number;
    growth: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    mrrGrowth: number;
    customerCount: number;
    customerGrowth: number;
    churnRate: number;
  };
  activity: {
    recentLogs: any[];
    totalActions: number;
  };
}

export const useSuperAdminData = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(
        `https://lmqyizrnuahkmwauonqr.supabase.co/functions/v1/get-super-admin-kpis`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch KPIs');
      }

      const result = await response.json();
      setKpiData(result.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  return {
    kpiData,
    loading,
    error,
    refreshKPIs: fetchKPIs,
  };
};