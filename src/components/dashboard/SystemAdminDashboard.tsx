import React, { useState, useEffect, useCallback } from 'react';
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

  // Memoize fetchSystemStats to prevent unnecessary re-renders
  const fetchSystemStats = useCallback(async () => {
    try {
      setLoading(true);

      // Validate user permissions first
      if (user.role !== 'edufam_admin' && user.role !== 'elimisha_admin') {
        throw new Error('Unauthorized: Only system administrators can view system statistics');
      }

      // Fetch system-wide statistics with proper error handling
      const [
        schoolsResult,
        usersResult,
        transactionsResult,
        activeUsersResult
      ] = await Promise.allSettled([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('financial_transactions').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'active')
      ]);

      // Extract counts with proper error checking
      const totalSchools = schoolsResult.status === 'fulfilled' ? (schoolsResult.value?.count || 0) : 0;
      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value?.count || 0) : 0;
      const totalTransactions = transactionsResult.status === 'fulfilled' ? (transactionsResult.value?.count || 0) : 0;
      const activeUsers = activeUsersResult.status === 'fulfilled' ? (activeUsersResult.value?.count || 0) : 0;

      // Log any failed requests for debugging
      if (schoolsResult.status === 'rejected') {
        console.error('Schools query failed:', schoolsResult.reason);
      }
      if (usersResult.status === 'rejected') {
        console.error('Users query failed:', usersResult.reason);
      }
      if (transactionsResult.status === 'rejected') {
        console.error('Transactions query failed:', transactionsResult.reason);
      }
      if (activeUsersResult.status === 'rejected') {
        console.error('Active users query failed:', activeUsersResult.reason);
      }

      // Calculate system health based on query success
      const successfulQueries = [schoolsResult, usersResult, transactionsResult, activeUsersResult]
        .filter(result => result.status === 'fulfilled').length;
      const systemHealth = successfulQueries === 4 ? 'Excellent' : 
                          successfulQueries >= 3 ? 'Good' : 
                          successfulQueries >= 2 ? 'Fair' : 'Poor';

      setStats({
        totalSchools,
        totalUsers,
        activeUsers,
        systemHealth,
        totalTransactions,
        avgPerformance: successfulQueries * 25 // Performance based on query success
      });

    } catch (error: unknown) {
      console.error('Error fetching system stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system statistics';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set default stats on error
      setStats({
        totalSchools: 0,
        totalUsers: 0,
        activeUsers: 0,
        systemHealth: 'Error',
        totalTransactions: 0,
        avgPerformance: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user.role, toast]);

  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  return (
    <div className="space-y-6">
      <SystemStatsCards stats={stats} loading={loading} />
      <SystemActionsPanel onModalOpen={onModalOpen} />
    </div>
  );
};

export default SystemAdminDashboard;
