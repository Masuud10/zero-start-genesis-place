
import { supabase } from '@/integrations/supabase/client';

export interface BillingSubscription {
  id: string;
  school_id: string;
  plan_type: string;
  status: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BillingTransaction {
  id: string;
  school_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  payment_method?: string;
  stripe_payment_id?: string;
  created_at: string;
  processed_at?: string;
  school?: {
    id: string;
    name: string;
  };
}

export class BillingService {
  static async getSubscriptions(): Promise<{ data: BillingSubscription[] | null; error: any }> {
    try {
      console.log('📊 BillingService: Fetching subscriptions');

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          school:schools(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }

      console.log('📊 BillingService: Subscriptions fetched successfully');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('📊 BillingService: Error fetching subscriptions:', error);
      return { data: null, error };
    }
  }

  static async getTransactions(): Promise<{ data: BillingTransaction[] | null; error: any }> {
    try {
      console.log('📊 BillingService: Fetching transactions');

      const { data, error } = await supabase
        .from('billing_transactions')
        .select(`
          *,
          school:schools(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('📊 BillingService: Transactions fetched successfully');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('📊 BillingService: Error fetching transactions:', error);
      return { data: null, error };
    }
  }

  static async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingService: Updating subscription status:', subscriptionId, status);

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log('📊 BillingService: Subscription updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 BillingService: Error updating subscription:', error);
      return { success: false, error };
    }
  }
}
