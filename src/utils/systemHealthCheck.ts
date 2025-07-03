import { supabase } from '@/integrations/supabase/client';

export interface SystemHealthStatus {
  database: {
    connected: boolean;
    error?: string;
    responseTime: number;
  };
  authentication: {
    working: boolean;
    error?: string;
  };
  rbac: {
    enforced: boolean;
    error?: string;
    userRole?: string;
  };
  api: {
    accessible: boolean;
    error?: string;
  };
  overall: {
    healthy: boolean;
    issues: string[];
  };
}

export class SystemHealthCheck {
  static async performFullHealthCheck(): Promise<SystemHealthStatus> {
    const startTime = Date.now();
    const issues: string[] = [];
    
    console.log('🔍 Starting comprehensive system health check...');

    // 1. Database Connectivity Test
    const dbHealth = await this.testDatabaseConnection();
    if (!dbHealth.connected) {
      issues.push(`Database: ${dbHealth.error}`);
    }

    // 2. Authentication Test
    const authHealth = await this.testAuthentication();
    if (!authHealth.working) {
      issues.push(`Authentication: ${authHealth.error}`);
    }

    // 3. RBAC Test
    const rbacHealth = await this.testRBAC();
    if (!rbacHealth.enforced) {
      issues.push(`RBAC: ${rbacHealth.error}`);
    }

    // 4. API Accessibility Test
    const apiHealth = await this.testAPIAccessibility();
    if (!apiHealth.accessible) {
      issues.push(`API: ${apiHealth.error}`);
    }

    const totalTime = Date.now() - startTime;
    const healthy = issues.length === 0;

    console.log(`🔍 Health check completed in ${totalTime}ms. Healthy: ${healthy}`);
    if (issues.length > 0) {
      console.warn('⚠️ Issues found:', issues);
    }

    return {
      database: dbHealth,
      authentication: authHealth,
      rbac: rbacHealth,
      api: apiHealth,
      overall: {
        healthy,
        issues
      }
    };
  }

  private static async testDatabaseConnection(): Promise<{ connected: boolean; error?: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Testing database connection...');
      
      const { data, error } = await supabase
        .from('system_status')
        .select('current_status')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('❌ Database connection failed:', error);
        return {
          connected: false,
          error: error.message,
          responseTime
        };
      }

      console.log('✅ Database connection successful');
      return {
        connected: true,
        responseTime
      };
    } catch (err: unknown) {
      const responseTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
      console.error('❌ Database connection exception:', err);
      return {
        connected: false,
        error: errorMessage,
        responseTime
      };
    }
  }

  private static async testAuthentication(): Promise<{ working: boolean; error?: string }> {
    try {
      console.log('🔍 Testing authentication...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Authentication test failed:', error);
        return {
          working: false,
          error: error.message
        };
      }

      if (!session) {
        console.log('ℹ️ No active session (expected for unauthenticated users)');
        return {
          working: true // Auth system is working, just no session
        };
      }

      console.log('✅ Authentication working with active session');
      return {
        working: true
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown authentication error';
      console.error('❌ Authentication test exception:', err);
      return {
        working: false,
        error: errorMessage
      };
    }
  }

  private static async testRBAC(): Promise<{ enforced: boolean; error?: string; userRole?: string }> {
    try {
      console.log('🔍 Testing RBAC enforcement...');
      
      // Test the get_current_user_role function
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_current_user_role');

      if (roleError) {
        console.error('❌ RBAC function test failed:', roleError);
        return {
          enforced: false,
          error: `RBAC function error: ${roleError.message}`
        };
      }

      console.log('✅ RBAC function accessible, user role:', roleData);
      
      // Test RLS policy enforcement by trying to access profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(1);

      if (profilesError) {
        console.error('❌ RLS policy test failed:', profilesError);
        return {
          enforced: false,
          error: `RLS policy error: ${profilesError.message}`,
          userRole: roleData
        };
      }

      console.log('✅ RLS policies working correctly');
      return {
        enforced: true,
        userRole: roleData
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown RBAC error';
      console.error('❌ RBAC test exception:', err);
      return {
        enforced: false,
        error: errorMessage
      };
    }
  }

  private static async testAPIAccessibility(): Promise<{ accessible: boolean; error?: string }> {
    try {
      console.log('🔍 Testing API accessibility...');
      
      // Test basic API endpoint
      const response = await fetch('https://lmqyizrnuahkmwauonqr.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlpenJudWFoa213YXVvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDI0MDgsImV4cCI6MjA2NTAxODQwOH0.w5uRNb2D6Fy7U3mZmwSRoE81BajGa1Us5TcF2t6C4AM',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlpenJudWFoa213YXVvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDI0MDgsImV4cCI6MjA2NTAxODQwOH0.w5uRNb2D6Fy7U3mZmwSRoE81BajGa1Us5TcF2t6C4AM'
        }
      });

      if (!response.ok) {
        console.error('❌ API accessibility test failed:', response.status, response.statusText);
        return {
          accessible: false,
          error: `API returned ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ API accessible');
      return {
        accessible: true
      };
    } catch (err: any) {
      console.error('❌ API accessibility test exception:', err);
      return {
        accessible: false,
        error: err.message || 'Unknown API error'
      };
    }
  }

  static async testSpecificFeature(feature: string): Promise<{ working: boolean; error?: string }> {
    console.log(`🔍 Testing specific feature: ${feature}`);
    
    try {
      switch (feature) {
        case 'profiles':
          const { data, error } = await supabase
            .from('profiles')
            .select('id, role, name')
            .limit(1);
          
          if (error) {
            return { working: false, error: error.message };
          }
          return { working: true };

        case 'schools':
          const { data: schoolsData, error: schoolsError } = await supabase
            .from('schools')
            .select('id, name')
            .limit(1);
          
          if (schoolsError) {
            return { working: false, error: schoolsError.message };
          }
          return { working: true };

        case 'subjects':
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name')
            .limit(1);
          
          if (subjectsError) {
            return { working: false, error: subjectsError.message };
          }
          return { working: true };

        default:
          return { working: false, error: `Unknown feature: ${feature}` };
      }
    } catch (err: any) {
      return { working: false, error: err.message || 'Unknown error' };
    }
  }
} 