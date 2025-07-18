const { createClient } = require('@supabase/supabase-js');

// Test script to verify super_admin access and enum fix
async function testSuperAdmin() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Testing super_admin access and enum fix...');
    
    // Test 1: Check if admin_users table exists and has super_admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'super_admin')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError);
      return;
    }
    
    console.log('✅ Found super_admin users:', adminUsers?.length || 0);
    if (adminUsers && adminUsers.length > 0) {
      console.log('📋 Super admin users:');
      adminUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Active: ${user.is_active}`);
      });
    }
    
    // Test 2: Check if profiles table has super_admin users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'super_admin');
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }
    
    console.log('✅ Found super_admin profiles:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('📋 Super admin profiles:');
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.name}) - Status: ${profile.status}`);
      });
    }
    
    // Test 3: Check if edufam_admin users exist (should be converted to super_admin)
    const { data: edufamAdmins, error: edufamError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'edufam_admin');
    
    if (edufamError) {
      console.error('❌ Error fetching edufam_admin users:', edufamError);
      return;
    }
    
    console.log('✅ Found edufam_admin users:', edufamAdmins?.length || 0);
    if (edufamAdmins && edufamAdmins.length > 0) {
      console.log('⚠️  WARNING: Found edufam_admin users that should be converted to super_admin:');
      edufamAdmins.forEach(user => {
        console.log(`  - ${user.email} (${user.name})`);
      });
    }
    
    // Test 4: Check if edufam_admin profiles exist
    const { data: edufamProfiles, error: edufamProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'edufam_admin');
    
    if (edufamProfileError) {
      console.error('❌ Error fetching edufam_admin profiles:', edufamProfileError);
      return;
    }
    
    console.log('✅ Found edufam_admin profiles:', edufamProfiles?.length || 0);
    if (edufamProfiles && edufamProfiles.length > 0) {
      console.log('⚠️  WARNING: Found edufam_admin profiles that should be converted to super_admin:');
      edufamProfiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.name}) - Status: ${profile.status}`);
      });
    }
    
    // Test 5: Test enum values by trying to insert a test record
    console.log('\n🧪 Testing enum values...');
    try {
      const { error: enumTestError } = await supabase
        .from('admin_users')
        .insert({
          user_id: 'test-enum-check',
          email: 'test-enum@example.com',
          name: 'Test Enum Check',
          role: 'edufam_admin',
          app_type: 'admin',
          is_active: false,
          permissions: {}
        });
      
      if (enumTestError && enumTestError.code === '22P02') {
        console.log('❌ Enum issue still exists - edufam_admin not in admin_role enum');
        console.log('   Error:', enumTestError.message);
      } else if (enumTestError) {
        console.log('⚠️  Other error during enum test:', enumTestError.message);
      } else {
        console.log('✅ Enum test passed - edufam_admin is valid in admin_role enum');
        
        // Clean up test record
        await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', 'test-enum-check');
      }
    } catch (err) {
      console.log('⚠️  Enum test failed:', err.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log(`  - Super admin users in admin_users: ${adminUsers?.length || 0}`);
    console.log(`  - Super admin profiles: ${profiles?.length || 0}`);
    console.log(`  - Remaining edufam_admin users: ${edufamAdmins?.length || 0}`);
    console.log(`  - Remaining edufam_admin profiles: ${edufamProfiles?.length || 0}`);
    
    if ((adminUsers?.length || 0) > 0) {
      console.log('✅ Super admin access should work correctly');
    } else {
      console.log('❌ No super admin users found - this is the issue!');
    }
    
    if ((edufamAdmins?.length || 0) > 0 || (edufamProfiles?.length || 0) > 0) {
      console.log('⚠️  Still have edufam_admin records - run the migration to convert them');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSuperAdmin(); 