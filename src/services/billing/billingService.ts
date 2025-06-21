
import { supabase } from '@/integrations/supabase/client';

export interface BillingTransaction {
  id: string;
  school_id: string;
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

export interface SchoolBillingData {
  id: string;
  name: string;
  location?: string;
  created_at: string;
  total_transactions: number;
  total_amount: number;
  recent_transaction?: string;
}

export class BillingService {
  static async getSchoolBillingData(): Promise<{ data: SchoolBillingData[] | null; error: any }> {
    try {
      console.log('📊 BillingService: Fetching school billing data');

      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          location,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      // Get transaction summaries for each school
      const schoolBillingData = await Promise.all(
        (schools || []).map(async (school) => {
          const { data: transactions, error: transError } = await supabase
            .from('billing_transactions')
            .select('amount, created_at')
            .eq('school_id', school.id);

          const totalAmount = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          const recentTransaction = transactions?.length > 0 
            ? new Date(Math.max(...transactions.map(t => new Date(t.created_at).getTime()))).toISOString()
            : undefined;

          return {
            id: school.id,
            name: school.name,
            location: school.location,
            created_at: school.created_at,
            total_transactions: transactions?.length || 0,
            total_amount: totalAmount,
            recent_transaction: recentTransaction
          };
        })
      );

      console.log('📊 BillingService: School billing data fetched successfully');
      return { data: schoolBillingData, error: null };

    } catch (error: any) {
      console.error('📊 BillingService: Error fetching school billing data:', error);
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

  static async updateTransactionStatus(transactionId: string, status: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingService: Updating transaction status:', transactionId, status);

      const { error } = await supabase
        .from('billing_transactions')
        .update({ 
          status, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', transactionId);

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      console.log('📊 BillingService: Transaction updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 BillingService: Error updating transaction:', error);
      return { success: false, error };
    }
  }

  static async getSchoolFinancialSummary(): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 BillingService: Fetching financial summary');

      // Get total fees and payments from financial_transactions
      const { data: transactions, error: transError } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_type, school_id, schools(name)')
        .in('transaction_type', ['fee_payment', 'fee_collection']);

      if (transError) {
        console.error('Error fetching financial transactions:', transError);
        throw transError;
      }

      // Get fees data
      const { data: fees, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, status, school_id');

      if (feesError) {
        console.error('Error fetching fees:', feesError);
        throw feesError;
      }

      // Calculate summary
      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalFees = fees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
      const totalPaid = fees?.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0) || 0;
      const pendingFees = fees?.filter(f => f.status === 'pending').length || 0;

      const summary = {
        total_revenue: totalRevenue,
        total_fees: totalFees,
        total_paid: totalPaid,
        outstanding_amount: totalFees - totalPaid,
        pending_transactions: pendingFees,
        collection_rate: totalFees > 0 ? (totalPaid / totalFees) * 100 : 0
      };

      console.log('📊 BillingService: Financial summary calculated');
      return { data: summary, error: null };

    } catch (error: any) {
      console.error('📊 BillingService: Error fetching financial summary:', error);
      return { data: null, error };
    }
  }
}
