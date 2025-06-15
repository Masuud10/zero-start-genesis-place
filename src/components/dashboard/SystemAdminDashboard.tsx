
import React, { useState, useEffect } from 'react';
import { AuthUser } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SystemStatsCards from './admin/SystemStatsCards';
import SystemActionsPanel from './admin/SystemActionsPanel';

interface SystemAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

interface SystemStats {
  totalSchools: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: string;
  totalTransactions: number;
  avgPerformance: number;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ user, onModalOpen }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats>({
    totalSchools: 0,
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'Good',
    totalTransactions: 0,
    avgPerformance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);

      // Fetch system-wide statistics
      const [
        schoolsResult,
        usersResult,
        transactionsResult
      ] = await Promise.allSettled([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('financial_transactions').select('id', { count: 'exact' })
      ]);

      const totalSchools = schoolsResult.status === 'fulfilled' ? (schoolsResult.value?.count || 0) : 0;
      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value?.count || 0) : 0;
      const totalTransactions = transactionsResult.status === 'fulfilled' ? (transactionsResult.value?.count || 0) : 0;

      setStats({
        totalSchools,
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.8), // Mock active users
        systemHealth: 'Good',
        totalTransactions,
        avgPerformance: 98.5 // Mock performance metric
      });

    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Administration</h2>
          <p className="text-muted-foreground">
            Welcome {user.name}! Monitor and manage the entire EduFam system.
          </p>
        </div>
      </div>

      <SystemStatsCards stats={stats} loading={loading} />
      <SystemActionsPanel onModalOpen={onModalOpen} />
    </div>
  );
};

export default SystemAdminDashboard;
