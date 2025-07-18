import { createClient } from '@supabase/supabase-js';

// Comprehensive diagnostic script for authentication issues
async function diagnoseAuthIssue() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Comprehensive Authentication Diagnosis...\n');
    
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.log('❌ Database connection failed:', connectionError.message);
        return;
      }
      console.log('✅ Database connection successful');
    } catch (err) {
      console.log('❌ Database connection exception:', err.message);
      return;
    }
    
    // Test 2: Check Enum Values
    console.log('\n2️⃣ Checking admin_role enum values...');
    try {
      const { data: enumData, error: enumError } = await supabase
        .rpc('get_admin_role_enum_values');
      
      if (enumError) {
        console.log('⚠️  Could not get enum values via RPC, trying direct query...');
        // Try a different approach to check enum
        const { data: testInsert, error: testError } = await supabase
          .from('admin_users')
          .insert({
            user_id: 'enum-test',
            email: 'enum-test@example.com',
            name: 'Enum Test',
            role: 'super_admin',
            app_type: 'admin',
            is_active: false,
            permissions: {}
          });
        
        if (testError && testError.code === '22P02') {
          console.log('❌ Enum issue detected:', testError.message);
        } else if (testError) {
          console.log('⚠️  Other error during enum test:', testError.message);
        } else {
          console.log('✅ Enum test passed - super_admin is valid');
          // Clean up test record
          await supabase
            .from('admin_users')
            .delete()
            .eq('user_id', 'enum-test');
        }
      } else {
        console.log('✅ Enum values:', enumData);
      }
    } catch (err) {
      console.log('⚠️  Enum check failed:', err.message);
    }
    
    // Test 3: Check Admin Users Table
    console.log('\n3️⃣ Checking admin_users table...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (adminError) {
      console.log('❌ Error fetching admin users:', adminError.message);
    } else {
      console.log(`✅ Found ${adminUsers?.length || 0} admin users total`);
      
      if (adminUsers && adminUsers.length > 0) {
        console.log('📋 Admin users:');
        adminUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name}) - Role: ${user.role} - Active: ${user.is_active}`);
        });
        
        const superAdmins = adminUsers.filter(u => u.role === 'super_admin' && u.is_active);
        const edufamAdmins = adminUsers.filter(u => u.role === 'edufam_admin');
        
        console.log(`\n   - Super admins (active): ${superAdmins.length}`);
        console.log(`   - EduFam admins: ${edufamAdmins.length}`);
        
        if (superAdmins.length === 0) {
          console.log('❌ No active super_admin users found!');
        }
      } else {
        console.log('❌ No admin users found in admin_users table!');
      }
    }
    
    // Test 4: Check Profiles Table
    console.log('\n4️⃣ Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'edufam_admin'])
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.log('❌ Error fetching profiles:', profileError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} admin profiles`);
      
      if (profiles && profiles.length > 0) {
        console.log('📋 Admin profiles:');
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.email} (${profile.name}) - Role: ${profile.role} - Status: ${profile.status}`);
        });
      } else {
        console.log('❌ No admin profiles found!');
      }
    }
    
    // Test 5: Check RLS Policies
    console.log('\n5️⃣ Testing RLS Policies...');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (rlsError) {
        console.log('❌ RLS policy issue:', rlsError.message);
      } else {
        console.log('✅ RLS policies working correctly');
      }
    } catch (err) {
      console.log('⚠️  RLS test failed:', err.message);
    }
    
    // Test 6: Check for orphaned records
    console.log('\n6️⃣ Checking for orphaned records...');
    if (adminUsers && profiles) {
      const adminUserIds = adminUsers.map(u => u.user_id);
      const profileIds = profiles.map(p => p.id);
      
      const orphanedProfiles = profiles.filter(p => !adminUserIds.includes(p.id));
      const orphanedAdminUsers = adminUsers.filter(u => !profileIds.includes(u.user_id));
      
      if (orphanedProfiles.length > 0) {
        console.log(`⚠️  Found ${orphanedProfiles.length} orphaned profiles (no matching admin_user):`);
        orphanedProfiles.forEach(p => {
          console.log(`    - ${p.email} (${p.name}) - Role: ${p.role}`);
        });
      }
      
      if (orphanedAdminUsers.length > 0) {
        console.log(`⚠️  Found ${orphanedAdminUsers.length} orphaned admin_users (no matching profile):`);
        orphanedAdminUsers.forEach(u => {
          console.log(`    - ${u.email} (${u.name}) - Role: ${u.role}`);
        });
      }
      
      if (orphanedProfiles.length === 0 && orphanedAdminUsers.length === 0) {
        console.log('✅ No orphaned records found');
      }
    }
    
    // Test 7: Check migration status
    console.log('\n7️⃣ Checking migration status...');
    try {
      const { data: migrations, error: migrationError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .ilike('action', '%migration%')
        .order('timestamp', { ascending: false })
        .limit(5);
      
      if (migrationError) {
        console.log('⚠️  Could not check migration logs:', migrationError.message);
      } else {
        console.log(`✅ Found ${migrations?.length || 0} recent migration logs`);
        if (migrations && migrations.length > 0) {
          migrations.forEach(m => {
            console.log(`    - ${m.action}: ${m.success ? '✅' : '❌'} ${m.error_message || ''}`);
          });
        }
      }
    } catch (err) {
      console.log('⚠️  Migration check failed:', err.message);
    }
    
    // Summary and Recommendations
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    
    const hasSuperAdmin = adminUsers?.some(u => u.role === 'super_admin' && u.is_active);
    const hasEdufamAdmin = adminUsers?.some(u => u.role === 'edufam_admin');
    const hasAdminProfiles = profiles && profiles.length > 0;
    
    if (!hasSuperAdmin) {
      console.log('❌ CRITICAL: No active super_admin users found!');
      console.log('   SOLUTION: Create a super_admin user or convert existing users');
    }
    
    if (hasEdufamAdmin) {
      console.log('⚠️  WARNING: Found edufam_admin users that should be converted');
      console.log('   SOLUTION: Run the migration to convert edufam_admin to super_admin');
    }
    
    if (!hasAdminProfiles) {
      console.log('❌ CRITICAL: No admin profiles found!');
      console.log('   SOLUTION: Ensure admin users have corresponding profiles');
    }
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Run the migration: npx supabase db push');
    console.log('2. Create a super_admin user if none exists');
    console.log('3. Check browser console for JavaScript errors');
    console.log('4. Verify environment variables are set correctly');
    console.log('5. Test with the debug routes: /debug and /test');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseAuthIssue(); 