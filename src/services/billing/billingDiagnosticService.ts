import { supabase } from '@/integrations/supabase/client';

export interface DataIntegrityResult {
  orphanedRecords: number;
  missingSchools: string[];
  totalRecords: number;
  error?: string;
}

export interface QueryPerformanceResult {
  avgResponseTime: number;
  recordsPerSecond: number;
  recommendedLimit: number;
  error?: string;
}

export class BillingDiagnosticService {
  // Check for orphaned billing records
  static async checkDataIntegrity(): Promise<DataIntegrityResult> {
    try {
      console.log('🔍 BillingDiagnosticService: Starting data integrity check...');

      // Check for billing records with non-existent schools
      const { data: orphanedData, error: orphanedError } = await supabase
        .from('school_billing_records')
        .select('id, school_id')
        .not('school_id', 'in', 
          supabase
            .from('schools')
            .select('id')
        )
        .limit(100);

      if (orphanedError) {
        console.error('❌ Error checking orphaned records:', orphanedError);
        return { orphanedRecords: 0, missingSchools: [], totalRecords: 0, error: orphanedError.message };
      }

      // Get total billing records count
      const { count: totalCount, error: countError } = await supabase
        .from('school_billing_records')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Error getting total count:', countError);
        return { orphanedRecords: 0, missingSchools: [], totalRecords: 0, error: countError.message };
      }

      const orphanedRecords = orphanedData?.length || 0;
      const missingSchools = orphanedData?.map(record => record.school_id) || [];

      console.log('✅ BillingDiagnosticService: Data integrity check completed');
      console.log(`📊 Total records: ${totalCount}, Orphaned: ${orphanedRecords}`);

      return {
        orphanedRecords,
        missingSchools,
        totalRecords: totalCount || 0
      };
    } catch (error: unknown) {
      console.error('❌ BillingDiagnosticService: Critical error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        orphanedRecords: 0, 
        missingSchools: [], 
        totalRecords: 0, 
        error: errorMessage 
      };
    }
  }

  // Performance analysis of billing queries
  static async analyzeQueryPerformance(): Promise<QueryPerformanceResult> {
    try {
      console.log('🔍 BillingDiagnosticService: Analyzing query performance...');

      const startTime = Date.now();
      
      // Test query with small limit
      const { data, error } = await supabase
        .from('school_billing_records')
        .select('id, created_at, school_id')
        .order('created_at', { ascending: false })
        .limit(10);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (error) {
        console.error('❌ Error in performance test:', error);
        return { avgResponseTime: 0, recordsPerSecond: 0, recommendedLimit: 25, error: error.message };
      }

      const recordCount = data?.length || 0;
      const recordsPerSecond = recordCount > 0 ? (recordCount / responseTime) * 1000 : 0;
      
      // Calculate recommended limit based on performance
      let recommendedLimit = 25;
      if (responseTime < 100) {
        recommendedLimit = 50;
      } else if (responseTime > 1000) {
        recommendedLimit = 10;
      }

      console.log('✅ BillingDiagnosticService: Performance analysis completed');
      console.log(`📊 Response time: ${responseTime}ms, Records/sec: ${recordsPerSecond.toFixed(2)}`);

      return {
        avgResponseTime: responseTime,
        recordsPerSecond,
        recommendedLimit
      };
    } catch (error: unknown) {
      console.error('❌ BillingDiagnosticService: Performance analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        avgResponseTime: 0, 
        recordsPerSecond: 0, 
        recommendedLimit: 25, 
        error: errorMessage 
      };
    }
  }
}
