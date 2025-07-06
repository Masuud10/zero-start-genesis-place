import { supabase } from '@/integrations/supabase/client';
import { BillingStats } from './types';

export interface BillingStatsResult {
  data: BillingStats | null;
  error: Error | null;
}

export class BillingStatsService {
  static async getBillingStats(): Promise<BillingStatsResult> {
    try {
      console.log('📊 BillingStatsService: Calculating billing statistics');

      const { data: records, error } = await supabase
        .from('school_billing_records')
        .select('*');

      if (error) {
        console.error('Error fetching records for stats:', error);
        throw error;
      }

      const stats: BillingStats = {
        total_schools: 0,
        total_revenue: 0,
        pending_payments: 0,
        active_subscriptions: 0,
        total_amount_expected: 0,
        outstanding_balance: 0
      };

      if (records && records.length > 0) {
        // Calculate totals
        records.forEach(record => {
          stats.total_amount_expected += Number(record.amount);

          if (record.status === 'paid') {
            stats.total_revenue += Number(record.amount);
          } else if (record.status === 'pending') {
            stats.pending_payments += Number(record.amount);
          }

          if (record.billing_type === 'subscription_fee' && record.status !== 'cancelled') {
            stats.active_subscriptions++;
          }
        });

        stats.outstanding_balance = stats.total_amount_expected - stats.total_revenue;

        // Count unique schools
        const uniqueSchools = new Set(records.map(r => r.school_id));
        stats.total_schools = uniqueSchools.size;
      }

      console.log('📊 BillingStatsService: Statistics calculated successfully');
      return { data: stats, error: null };

    } catch (error: unknown) {
      console.error('📊 BillingStatsService: Error calculating statistics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: new Error(errorMessage) };
    }
  }
}
