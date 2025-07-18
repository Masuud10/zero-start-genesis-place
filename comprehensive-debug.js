import { createClient } from '@supabase/supabase-js';

// Comprehensive debug script using the correct Supabase configuration
async function comprehensiveDebug() {
  try {
    // Use the same configuration as the application
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlpenJudWFoa213YXVvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDI0MDgsImV4cCI6MjA2NTAxODQwOH0.w5uRNb2D6Fy7U3mZmwSRoE81BajGa1Us5TcF2t6C4AM";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false, // Disable for Node.js environment
        autoRefreshToken: true,
      }
    });
    
    console.log('🔍 COMPREHENSIVE APPLICATION DEBUG\n');
    console.log('=====================================\n');
    
    // 1. DATABASE CONNECTION TEST
    console.log('1️⃣ DATABASE CONNECTION TEST');
    console.log('==========================');
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('company_details')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        console.log('❌ Database connection failed:', connectionError.message);
        console.log('   Code:', connectionError.code);
        console.log('   Details:', connectionError.details);
        console.log('   Hint:', connectionError.hint);
      } else {
        console.log('✅ Database connection successful');
        console.log('   Response:', connectionTest);
      }
    } catch (err) {
      console.log('❌ Database connection exception:', err.message);
    }
    console.log('');
    
    // 2. AUTHENTICATION SYSTEM TEST
    console.log('2️⃣ AUTHENTICATION SYSTEM TEST');
    console.log('==============================');
    
    // Test auth state
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    if (session) {
      console.log('   User ID:', session.user.id);
      console.log('   Email:', session.user.email);
    }
    console.log('');
    
    // 3. ADMIN USERS TABLE TEST
    console.log('3️⃣ ADMIN USERS TABLE TEST');
    console.log('==========================');
    try {
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (adminError) {
        console.log('❌ Error fetching admin users:', adminError.message);
        console.log('   Code:', adminError.code);
        console.log('   Details:', adminError.details);
      } else {
        console.log(`✅ Found ${adminUsers?.length || 0} admin users`);
        if (adminUsers && adminUsers.length > 0) {
          console.log('📋 Admin users:');
          adminUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (${user.name})`);
            console.log(`      - Role: ${user.role}`);
            console.log(`      - Active: ${user.is_active}`);
            console.log(`      - Created: ${user.created_at}`);
          });
          
          const superAdmins = adminUsers.filter(u => u.role === 'super_admin' && u.is_active);
          const edufamAdmins = adminUsers.filter(u => u.role === 'edufam_admin');
          
          console.log(`\n   Summary:`);
          console.log(`   - Super admins (active): ${superAdmins.length}`);
          console.log(`   - EduFam admins: ${edufamAdmins.length}`);
          
          if (superAdmins.length === 0) {
            console.log('   ❌ CRITICAL: No active super_admin users!');
          }
        } else {
          console.log('❌ CRITICAL: No admin users found!');
        }
      }
    } catch (err) {
      console.log('❌ Admin users test exception:', err.message);
    }
    console.log('');
    
    // 4. PROFILES TABLE TEST
    console.log('4️⃣ PROFILES TABLE TEST');
    console.log('=======================');
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['super_admin', 'edufam_admin'])
        .order('created_at', { ascending: false });
      
      if (profileError) {
        console.log('❌ Error fetching profiles:', profileError.message);
        console.log('   Code:', profileError.code);
      } else {
        console.log(`✅ Found ${profiles?.length || 0} admin profiles`);
        if (profiles && profiles.length > 0) {
          console.log('📋 Admin profiles:');
          profiles.forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.email} (${profile.name})`);
            console.log(`      - Role: ${profile.role}`);
            console.log(`      - Status: ${profile.status}`);
            console.log(`      - Created: ${profile.created_at}`);
          });
        } else {
          console.log('❌ CRITICAL: No admin profiles found!');
        }
      }
    } catch (err) {
      console.log('❌ Profiles test exception:', err.message);
    }
    console.log('');
    
    // 5. ENUM VALUES TEST
    console.log('5️⃣ ENUM VALUES TEST');
    console.log('===================');
    try {
      // Test enum by trying to insert a test record
      const { data: enumTest, error: enumError } = await supabase
        .from('admin_users')
        .insert({
          user_id: 'enum-test-' + Date.now(),
          email: 'enum-test@example.com',
          name: 'Enum Test',
          role: 'super_admin',
          app_type: 'admin',
          is_active: false,
          permissions: {}
        });
      
      if (enumError && enumError.code === '22P02') {
        console.log('❌ Enum issue detected:', enumError.message);
        console.log('   This means super_admin is not in the admin_role enum');
      } else if (enumError) {
        console.log('⚠️  Other error during enum test:', enumError.message);
        console.log('   Code:', enumError.code);
      } else {
        console.log('✅ Enum test passed - super_admin is valid');
        
        // Clean up test record
        await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', 'enum-test-' + Date.now());
      }
    } catch (err) {
      console.log('❌ Enum test exception:', err.message);
    }
    console.log('');
    
    // 6. RLS POLICIES TEST
    console.log('6️⃣ RLS POLICIES TEST');
    console.log('=====================');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (rlsError) {
        console.log('❌ RLS policy issue:', rlsError.message);
        console.log('   Code:', rlsError.code);
        console.log('   Details:', rlsError.details);
      } else {
        console.log('✅ RLS policies working correctly');
      }
    } catch (err) {
      console.log('❌ RLS test exception:', err.message);
    }
    console.log('');
    
    // 7. MIGRATION STATUS TEST
    console.log('7️⃣ MIGRATION STATUS TEST');
    console.log('=========================');
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
            console.log(`   - ${m.action}: ${m.success ? '✅' : '❌'} ${m.error_message || ''}`);
          });
        } else {
          console.log('⚠️  No migration logs found');
        }
      }
    } catch (err) {
      console.log('❌ Migration check exception:', err.message);
    }
    console.log('');
    
    // 8. ORPHANED RECORDS TEST
    console.log('8️⃣ ORPHANED RECORDS TEST');
    console.log('=========================');
    try {
      // Get admin users and profiles for comparison
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('user_id, email, role');
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, role')
        .in('role', ['super_admin', 'edufam_admin']);
      
      if (adminUsers && profiles) {
        const adminUserIds = adminUsers.map(u => u.user_id);
        const profileIds = profiles.map(p => p.id);
        
        const orphanedProfiles = profiles.filter(p => !adminUserIds.includes(p.id));
        const orphanedAdminUsers = adminUsers.filter(u => !profileIds.includes(u.user_id));
        
        if (orphanedProfiles.length > 0) {
          console.log(`⚠️  Found ${orphanedProfiles.length} orphaned profiles:`);
          orphanedProfiles.forEach(p => {
            console.log(`   - ${p.email} (${p.role})`);
          });
        }
        
        if (orphanedAdminUsers.length > 0) {
          console.log(`⚠️  Found ${orphanedAdminUsers.length} orphaned admin_users:`);
          orphanedAdminUsers.forEach(u => {
            console.log(`   - ${u.email} (${u.role})`);
          });
        }
        
        if (orphanedProfiles.length === 0 && orphanedAdminUsers.length === 0) {
          console.log('✅ No orphaned records found');
        }
      }
    } catch (err) {
      console.log('❌ Orphaned records test exception:', err.message);
    }
    console.log('');
    
    // 9. FRONTEND CONFIGURATION TEST
    console.log('9️⃣ FRONTEND CONFIGURATION TEST');
    console.log('===============================');
    console.log('Checking frontend configuration...');
    
    // Check if the app can access the Supabase client
    try {
      const { data: configTest } = await supabase
        .from('company_details')
        .select('id')
        .limit(1);
      
      console.log('✅ Frontend Supabase client working');
      console.log('   URL:', SUPABASE_URL);
      console.log('   Key length:', SUPABASE_PUBLISHABLE_KEY.length);
    } catch (err) {
      console.log('❌ Frontend configuration issue:', err.message);
    }
    console.log('');
    
    // 10. SUMMARY AND RECOMMENDATIONS
    console.log('🎯 SUMMARY AND RECOMMENDATIONS');
    console.log('===============================');
    
    // Collect all issues
    const issues = [];
    
    if (!adminUsers || adminUsers.length === 0) {
      issues.push('No admin users found');
    } else {
      const superAdmins = adminUsers.filter(u => u.role === 'super_admin' && u.is_active);
      if (superAdmins.length === 0) {
        issues.push('No active super_admin users');
      }
    }
    
    if (!profiles || profiles.length === 0) {
      issues.push('No admin profiles found');
    }
    
    if (issues.length > 0) {
      console.log('❌ CRITICAL ISSUES FOUND:');
      issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      
      console.log('\n🔧 IMMEDIATE ACTIONS REQUIRED:');
      console.log('1. Run the enum fix migration: npx supabase db push');
      console.log('2. Create a super admin user: node create-super-admin.js --default');
      console.log('3. Verify the setup: node test-super-admin.js');
      console.log('4. Test the application: npm run dev');
    } else {
      console.log('✅ No critical issues found');
      console.log('   The application should work correctly');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Test login with super admin credentials');
    console.log('3. Check debug routes: /debug and /test');
    console.log('4. Monitor network requests in browser dev tools');
    
  } catch (error) {
    console.error('❌ Comprehensive debug failed:', error);
  }
}

comprehensiveDebug(); 