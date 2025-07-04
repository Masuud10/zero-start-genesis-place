import { MaintenanceModeService } from '@/services/system/maintenanceModeService';

/**
 * Simple test to verify maintenance mode functionality
 */
export const testMaintenanceMode = async () => {
  console.log('🧪 Testing Maintenance Mode Functionality...');
  
  try {
    // Test 1: Enable maintenance mode
    console.log('\n1. Enabling maintenance mode...');
    const enableResult = await MaintenanceModeService.enableMaintenanceMode('Test maintenance mode');
    if (!enableResult.success) {
      console.error('❌ Failed to enable maintenance mode:', enableResult.error);
      return false;
    }
    console.log('✅ Maintenance mode enabled successfully');

    // Test 2: Check that non-admin users are blocked
    console.log('\n2. Testing user access control...');
    const nonAdminRoles = ['teacher', 'principal', 'parent', 'finance_officer', 'school_owner', 'student'];
    
    for (const role of nonAdminRoles) {
      const access = await MaintenanceModeService.checkUserAccess(role);
      if (access.allowed) {
        console.error(`❌ ${role} should be blocked but has access`);
        return false;
      }
      console.log(`✅ ${role} correctly blocked`);
    }

    // Test 3: Check that admin users can access
    console.log('\n3. Testing admin access...');
    const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
    if (!adminAccess.allowed) {
      console.error('❌ Admin should have access but is blocked');
      return false;
    }
    console.log('✅ Admin correctly has access');

    // Test 4: Disable maintenance mode
    console.log('\n4. Disabling maintenance mode...');
    const disableResult = await MaintenanceModeService.disableMaintenanceMode();
    if (!disableResult.success) {
      console.error('❌ Failed to disable maintenance mode:', disableResult.error);
      return false;
    }
    console.log('✅ Maintenance mode disabled successfully');

    // Test 5: Verify all users can access when disabled
    console.log('\n5. Testing normal access...');
    const allRoles = ['teacher', 'principal', 'parent', 'finance_officer', 'school_owner', 'student', 'edufam_admin'];
    
    for (const role of allRoles) {
      const access = await MaintenanceModeService.checkUserAccess(role);
      if (!access.allowed) {
        console.error(`❌ ${role} should have access when maintenance is disabled`);
        return false;
      }
      console.log(`✅ ${role} has normal access`);
    }

    console.log('\n🎉 All maintenance mode tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
};

/**
 * Test maintenance mode with real-time status checking
 */
export const testRealTimeMaintenance = async () => {
  console.log('🔄 Testing Real-Time Maintenance Mode...');
  
  try {
    // Enable maintenance mode
    await MaintenanceModeService.enableMaintenanceMode('Real-time test');
    
    // Test immediate blocking
    const teacherAccess = await MaintenanceModeService.checkUserAccess('teacher');
    const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
    
    console.log('Teacher access:', teacherAccess.allowed ? '❌ ALLOWED (should be blocked)' : '✅ BLOCKED');
    console.log('Admin access:', adminAccess.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    
    // Disable maintenance mode
    await MaintenanceModeService.disableMaintenanceMode();
    
    // Test immediate unblocking
    const teacherAccessAfter = await MaintenanceModeService.checkUserAccess('teacher');
    const adminAccessAfter = await MaintenanceModeService.checkUserAccess('edufam_admin');
    
    console.log('Teacher access after disable:', teacherAccessAfter.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    console.log('Admin access after disable:', adminAccessAfter.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    
    return true;
  } catch (error) {
    console.error('❌ Real-time test failed:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testMaintenanceMode = testMaintenanceMode;
  (window as unknown as Record<string, unknown>).testRealTimeMaintenance = testRealTimeMaintenance;
} 