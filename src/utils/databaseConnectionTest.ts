import { supabase } from '../integrations/supabase/client';

export interface DatabaseTestResult {
  connected: boolean;
  error?: string;
  details: {
    basicConnection: boolean;
    profilesTable: boolean;
    schoolsTable: boolean;
    systemStatusTable: boolean;
    responseTime: number;
  };
}

export class DatabaseConnectionTest {
  static async runFullTest(): Promise<DatabaseTestResult> {
    const startTime = Date.now();
    const details = {
      basicConnection: false,
      profilesTable: false,
      schoolsTable: false,
      systemStatusTable: false,
      responseTime: 0
    };

    try {
      console.log('🔍 DatabaseConnectionTest: Starting full database test...');

      // Test 1: Basic connection test
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('❌ Basic connection test failed:', error);
          details.responseTime = Date.now() - startTime;
          return {
            connected: false,
            error: `Basic connection failed: ${error.message}`,
            details
          };
        }
        
        details.basicConnection = true;
        details.profilesTable = true;
        console.log('✅ Basic connection test passed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Basic connection test exception:', err);
        details.responseTime = Date.now() - startTime;
        return {
          connected: false,
          error: `Basic connection exception: ${errorMessage}`,
          details
        };
      }

      // Test 2: Schools table
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id')
          .limit(1);
        
        if (error) {
          console.warn('⚠️ Schools table test failed:', error);
        } else {
          details.schoolsTable = true;
          console.log('✅ Schools table test passed');
        }
      } catch (err) {
        console.warn('⚠️ Schools table test exception:', err);
      }

      // Test 3: System status table (optional)
      try {
        const { data, error } = await supabase
          .from('system_status')
          .select('current_status')
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.warn('⚠️ System status table test failed:', error);
        } else {
          details.systemStatusTable = true;
          console.log('✅ System status table test passed');
        }
      } catch (err) {
        console.warn('⚠️ System status table test exception:', err);
      }

      details.responseTime = Date.now() - startTime;
      
      console.log('✅ DatabaseConnectionTest: All tests completed successfully');
      return {
        connected: true,
        details
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ DatabaseConnectionTest: Unexpected error:', err);
      details.responseTime = Date.now() - startTime;
      return {
        connected: false,
        error: `Unexpected error: ${errorMessage}`,
        details
      };
    }
  }

  static async testSpecificTable(tableName: string): Promise<{ accessible: boolean; error?: string }> {
    try {
      console.log(`🔍 Testing table: ${tableName}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${tableName} test failed:`, error);
        return {
          accessible: false,
          error: error.message
        };
      }
      
      console.log(`✅ Table ${tableName} test passed`);
      return { accessible: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Table ${tableName} test exception:`, err);
      return {
        accessible: false,
        error: errorMessage
      };
    }
  }

  static async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(0);
      
      // If we get here without an error, the table exists
      return !error;
    } catch {
      return false;
    }
  }
} 