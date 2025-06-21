
import { supabase } from '@/integrations/supabase/client';

export interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  recorded_at: string;
  metadata?: any;
}

export interface SystemHealthData {
  uptime_percent: number;
  response_time_ms: number;
  error_rate: number;
  active_users: number;
  database_status: string;
  api_status: string;
  last_updated: string;
}

export class SystemHealthService {
  static async getSystemMetrics(): Promise<{ data: SystemMetric[] | null; error: any }> {
    try {
      console.log('🏥 SystemHealthService: Fetching system metrics');

      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching system metrics:', error);
        throw error;
      }

      console.log('🏥 SystemHealthService: Metrics fetched successfully');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('🏥 SystemHealthService: Error fetching metrics:', error);
      return { data: null, error };
    }
  }

  static async getSystemHealth(): Promise<{ data: SystemHealthData | null; error: any }> {
    try {
      console.log('🏥 SystemHealthService: Calculating system health');

      // Get basic system stats
      const [schoolsResult, usersResult, transactionsResult] = await Promise.allSettled([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('financial_transactions').select('id', { count: 'exact' })
      ]);

      const totalSchools = schoolsResult.status === 'fulfilled' ? (schoolsResult.value?.count || 0) : 0;
      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value?.count || 0) : 0;
      const totalTransactions = transactionsResult.status === 'fulfilled' ? (transactionsResult.value?.count || 0) : 0;

      // Calculate mock health metrics based on real data
      const healthData: SystemHealthData = {
        uptime_percent: 98.5 + Math.random() * 1.5, // 98.5-100%
        response_time_ms: 150 + Math.random() * 100, // 150-250ms
        error_rate: Math.random() * 0.5, // 0-0.5%
        active_users: Math.floor(totalUsers * 0.3), // 30% of users active
        database_status: 'healthy',
        api_status: 'operational',
        last_updated: new Date().toISOString()
      };

      console.log('🏥 SystemHealthService: Health data calculated');
      return { data: healthData, error: null };

    } catch (error: any) {
      console.error('🏥 SystemHealthService: Error calculating health:', error);
      return { data: null, error };
    }
  }

  static async recordSystemMetric(metricName: string, value: number, type: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🏥 SystemHealthService: Recording metric:', metricName, value);

      const { error } = await supabase
        .from('system_metrics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          metric_type: type,
          recorded_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording metric:', error);
        throw error;
      }

      console.log('🏥 SystemHealthService: Metric recorded successfully');
      return { success: true };

    } catch (error: any) {
      console.error('🏥 SystemHealthService: Error recording metric:', error);
      return { success: false, error };
    }
  }
}
