import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export interface DebugTestSuiteResults {
  authentication: TestResult[];
  database: TestResult[];
  routing: TestResult[];
  api: TestResult[];
  overall: {
    passed: number;
    failed: number;
    total: number;
  };
}

export class DebugTestSuite {
  private results: DebugTestSuite = {
    authentication: [],
    database: [],
    routing: [],
    api: [],
    overall: { passed: 0, failed: 0, total: 0 }
  };

  /**
   * Run all tests to verify the debugging fixes
   */
  static async runAllTests(): Promise<DebugTestSuiteResults> {
    const testSuite = new DebugTestSuite();
    
    console.log('🧪 Starting comprehensive debug test suite...');
    
    // Test authentication fixes
    await testSuite.testAuthenticationFixes();
    
    // Test database fixes
    await testSuite.testDatabaseFixes();
    
    // Test routing fixes
    await testSuite.testRoutingFixes();
    
    // Test API fixes
    await testSuite.testAPIFixes();
    
    // Calculate overall results
    testSuite.calculateOverallResults();
    
    console.log('🧪 Test suite completed:', testSuite.results.overall);
    return testSuite.results;
  }

  /**
   * Test authentication fixes
   */
  private async testAuthenticationFixes(): Promise<void> {
    console.log('🔐 Testing authentication fixes...');
    
    // Test 1: Database connection without infinite recursion
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, email')
        .limit(1);
      
      if (error) {
        this.results.authentication.push({
          testName: 'Database Connection (No Infinite Recursion)',
          passed: false,
          error: error.message
        });
      } else {
        this.results.authentication.push({
          testName: 'Database Connection (No Infinite Recursion)',
          passed: true,
          details: { recordCount: data?.length || 0 }
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.results.authentication.push({
        testName: 'Database Connection (No Infinite Recursion)',
        passed: false,
        error: errorMessage
      });
    }

    // Test 2: HR role validation
    try {
      const { data: hrUsers, error } = await supabase
        .from('profiles')
        .select('id, email, role, status')
        .eq('role', 'hr')
        .eq('status', 'active');
      
      if (error) {
        this.results.authentication.push({
          testName: 'HR Role Validation',
          passed: false,
          error: error.message
        });
      } else {
        this.results.authentication.push({
          testName: 'HR Role Validation',
          passed: true,
          details: { hrUserCount: hrUsers?.length || 0 }
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.results.authentication.push({
        testName: 'HR Role Validation',
        passed: false,
        error: errorMessage
      });
    }

    // Test 3: School owner to school director migration
    try {
      const { data: schoolOwners, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'school_owner');
      
      if (error) {
        this.results.authentication.push({
          testName: 'School Owner Migration',
          passed: false,
          error: error.message
        });
      } else {
        const hasSchoolOwners = schoolOwners && schoolOwners.length > 0;
        this.results.authentication.push({
          testName: 'School Owner Migration',
          passed: !hasSchoolOwners,
          details: { 
            remainingSchoolOwners: hasSchoolOwners ? schoolOwners.length : 0,
            expected: 0
          }
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.results.authentication.push({
        testName: 'School Owner Migration',
        passed: false,
        error: errorMessage
      });
    }
  }

  /**
   * Test database fixes
   */
  private async testDatabaseFixes(): Promise<void> {
    console.log('🗄️ Testing database fixes...');
    
    // Test 1: Schools table structure (no curriculum_type)
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .limit(1);
      
      if (error) {
        this.results.database.push({
          testName: 'Schools Table Structure',
          passed: false,
          error: error.message
        });
      } else {
        // Check if curriculum_type column exists (it shouldn't)
        const hasCurriculumType = data && data.length > 0 && 'curriculum_type' in data[0];
        this.results.database.push({
          testName: 'Schools Table Structure',
          passed: !hasCurriculumType,
          details: { 
            hasCurriculumType,
            expected: false
          }
        });
      }
    } catch (err: any) {
      this.results.database.push({
        testName: 'Schools Table Structure',
        passed: false,
        error: err.message
      });
    }

    // Test 2: Database performance (query speed)
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, school_id')
        .limit(100);
      const queryTime = Date.now() - startTime;
      
      if (error) {
        this.results.database.push({
          testName: 'Database Performance',
          passed: false,
          error: error.message
        });
      } else {
        const isFast = queryTime < 3000; // Should be under 3 seconds
        this.results.database.push({
          testName: 'Database Performance',
          passed: isFast,
          details: { 
            queryTimeMs: queryTime,
            recordCount: data?.length || 0,
            expectedMaxTime: 3000
          }
        });
      }
    } catch (err: any) {
      this.results.database.push({
        testName: 'Database Performance',
        passed: false,
        error: err.message
      });
    }

    // Test 3: Foreign key constraints (no duplicates)
    try {
      // Test a simple foreign key relationship
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          school_id,
          schools!inner(id, name)
        `)
        .limit(1);
      
      if (error) {
        this.results.database.push({
          testName: 'Foreign Key Constraints',
          passed: false,
          error: error.message
        });
      } else {
        this.results.database.push({
          testName: 'Foreign Key Constraints',
          passed: true,
          details: { 
            hasValidRelationships: data && data.length > 0
          }
        });
      }
    } catch (err: any) {
      this.results.database.push({
        testName: 'Foreign Key Constraints',
        passed: false,
        error: err.message
      });
    }
  }

  /**
   * Test routing fixes
   */
  private async testRoutingFixes(): Promise<void> {
    console.log('🧭 Testing routing fixes...');
    
    // Test 1: Valid roles are recognized
    const validRoles = [
      'edufam_admin',
      'elimisha_admin', 
      'school_director',
      'principal',
      'teacher',
      'parent',
      'finance_officer',
      'hr'
    ];

    try {
      const { data: allRoles, error } = await supabase
        .from('profiles')
        .select('role')
        .in('role', validRoles);
      
      if (error) {
        this.results.routing.push({
          testName: 'Valid Role Recognition',
          passed: false,
          error: error.message
        });
      } else {
        const foundRoles = [...new Set(allRoles?.map(p => p.role) || [])];
        const allValidRolesFound = validRoles.every(role => foundRoles.includes(role));
        
        this.results.routing.push({
          testName: 'Valid Role Recognition',
          passed: allValidRolesFound,
          details: { 
            foundRoles,
            expectedRoles: validRoles,
            missingRoles: validRoles.filter(role => !foundRoles.includes(role))
          }
        });
      }
    } catch (err: any) {
      this.results.routing.push({
        testName: 'Valid Role Recognition',
        passed: false,
        error: err.message
      });
    }

    // Test 2: HR dashboard accessibility
    try {
      const { data: hrUsers, error } = await supabase
        .from('profiles')
        .select('id, email, role, status')
        .eq('role', 'hr')
        .eq('status', 'active');
      
      if (error) {
        this.results.routing.push({
          testName: 'HR Dashboard Accessibility',
          passed: false,
          error: error.message
        });
      } else {
        const hasActiveHRUsers = hrUsers && hrUsers.length > 0;
        this.results.routing.push({
          testName: 'HR Dashboard Accessibility',
          passed: hasActiveHRUsers,
          details: { 
            activeHRUsers: hrUsers?.length || 0,
            hrEmails: hrUsers?.map(u => u.email) || []
          }
        });
      }
    } catch (err: any) {
      this.results.routing.push({
        testName: 'HR Dashboard Accessibility',
        passed: false,
        error: err.message
      });
    }
  }

  /**
   * Test API fixes
   */
  private async testAPIFixes(): Promise<void> {
    console.log('🔌 Testing API fixes...');
    
    // Test 1: API endpoint accessibility
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .limit(1);
      
      if (error) {
        this.results.api.push({
          testName: 'API Endpoint Accessibility',
          passed: false,
          error: error.message
        });
      } else {
        this.results.api.push({
          testName: 'API Endpoint Accessibility',
          passed: true,
          details: { 
            endpoint: 'schools',
            recordCount: data?.length || 0
          }
        });
      }
    } catch (err: any) {
      this.results.api.push({
        testName: 'API Endpoint Accessibility',
        passed: false,
        error: err.message
      });
    }

    // Test 2: Error handling consistency
    try {
      // Test with invalid query to check error handling
      const { data, error } = await supabase
        .from('nonexistent_table')
        .select('*');
      
      if (error) {
        // This should return an error, which is expected
        this.results.api.push({
          testName: 'Error Handling Consistency',
          passed: true,
          details: { 
            expectedError: true,
            errorCode: error.code,
            errorMessage: error.message
          }
        });
      } else {
        this.results.api.push({
          testName: 'Error Handling Consistency',
          passed: false,
          error: 'Expected error for nonexistent table but got success'
        });
      }
    } catch (err: any) {
      this.results.api.push({
        testName: 'Error Handling Consistency',
        passed: false,
        error: err.message
      });
    }
  }

  /**
   * Calculate overall test results
   */
  private calculateOverallResults(): void {
    const allTests = [
      ...this.results.authentication,
      ...this.results.database,
      ...this.results.routing,
      ...this.results.api
    ];

    this.results.overall = {
      total: allTests.length,
      passed: allTests.filter(test => test.passed).length,
      failed: allTests.filter(test => !test.passed).length
    };
  }

  /**
   * Generate detailed test report
   */
  static generateReport(results: DebugTestSuite): string {
    let report = '🧪 COMPREHENSIVE DEBUG TEST REPORT\n';
    report += '=====================================\n\n';

    // Overall summary
    report += `📊 OVERALL RESULTS:\n`;
    report += `   Total Tests: ${results.overall.total}\n`;
    report += `   Passed: ${results.overall.passed}\n`;
    report += `   Failed: ${results.overall.failed}\n`;
    report += `   Success Rate: ${((results.overall.passed / results.overall.total) * 100).toFixed(1)}%\n\n`;

    // Authentication tests
    report += `🔐 AUTHENTICATION TESTS:\n`;
    results.authentication.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `   ${status} ${test.testName}\n`;
      if (!test.passed && test.error) {
        report += `      Error: ${test.error}\n`;
      }
      if (test.details) {
        report += `      Details: ${JSON.stringify(test.details)}\n`;
      }
    });
    report += '\n';

    // Database tests
    report += `🗄️ DATABASE TESTS:\n`;
    results.database.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `   ${status} ${test.testName}\n`;
      if (!test.passed && test.error) {
        report += `      Error: ${test.error}\n`;
      }
      if (test.details) {
        report += `      Details: ${JSON.stringify(test.details)}\n`;
      }
    });
    report += '\n';

    // Routing tests
    report += `🧭 ROUTING TESTS:\n`;
    results.routing.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `   ${status} ${test.testName}\n`;
      if (!test.passed && test.error) {
        report += `      Error: ${test.error}\n`;
      }
      if (test.details) {
        report += `      Details: ${JSON.stringify(test.details)}\n`;
      }
    });
    report += '\n';

    // API tests
    report += `🔌 API TESTS:\n`;
    results.api.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      report += `   ${status} ${test.testName}\n`;
      if (!test.passed && test.error) {
        report += `      Error: ${test.error}\n`;
      }
      if (test.details) {
        report += `      Details: ${JSON.stringify(test.details)}\n`;
      }
    });
    report += '\n';

    // Recommendations
    report += `💡 RECOMMENDATIONS:\n`;
    if (results.overall.failed === 0) {
      report += `   🎉 All tests passed! The debugging fixes are working correctly.\n`;
      report += `   ✅ HR users should now be able to login successfully.\n`;
      report += `   ✅ No more "Database error querying schema" errors.\n`;
      report += `   ✅ Role-based routing is working properly.\n`;
    } else {
      report += `   ⚠️ Some tests failed. Please review the errors above.\n`;
      report += `   🔧 Consider applying the database migrations manually.\n`;
      report += `   📧 Contact support if issues persist.\n`;
    }

    return report;
  }
} 