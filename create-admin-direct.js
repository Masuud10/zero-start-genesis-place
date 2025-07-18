import { createClient } from '@supabase/supabase-js';

// Direct script to create super admin user
async function createSuperAdminDirect() {
  try {
    // Use the same configuration as the application
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlpenJudWFoa213YXVvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDI0MDgsImV4cCI6MjA2NTAxODQwOH0.w5uRNb2D6Fy7U3mZmwSRoE81BajGa1Us5TcF2t6C4AM";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      }
    });
    
    console.log('🔧 Creating Super Admin User Directly...\n');
    
    const email = 'admin@edufam.com';
    const name = 'EduFam Super Admin';
    const password = 'Admin123!';
    
    // Check if already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existing) {
      console.log('✅ Default super admin already exists');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Role: ${existing.role}`);
      console.log(`Active: ${existing.is_active}`);
      return;
    }
    
    console.log('🔄 Creating default super admin...');
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }
    
    if (!authData.user) {
      console.error('❌ No user returned from auth signup');
      return;
    }
    
    console.log('✅ Auth user created successfully');
    console.log('   User ID:', authData.user.id);
    
    // Step 2: Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'super_admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      console.error('   Code:', profileError.code);
      console.error('   Details:', profileError.details);
      return;
    }
    
    console.log('✅ Profile created successfully');
    
    // Step 3: Create admin user
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        email,
        name,
        role: 'super_admin',
        app_type: 'admin',
        is_active: true,
        permissions: {
          "manage_admin_users": true,
          "view_admin_users": true,
          "manage_schools": true,
          "view_schools": true,
          "view_system_analytics": true,
          "view_school_analytics": true,
          "export_reports": true,
          "view_logs": true,
          "manage_database": true,
          "manage_deployments": true,
          "view_api_usage": true,
          "manage_support_tickets": true,
          "view_support_tickets": true,
          "manage_hr_records": true,
          "view_hr_records": true,
          "manage_marketing_campaigns": true,
          "view_marketing_analytics": true,
          "manage_events": true,
          "send_notifications": true,
          "manage_billing": true,
          "view_billing": true,
          "export_financial_reports": true,
          "manage_global_settings": true,
          "view_audit_logs": true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (adminError) {
      console.error('❌ Error creating admin user:', adminError.message);
      console.error('   Code:', adminError.code);
      console.error('   Details:', adminError.details);
      return;
    }
    
    console.log('✅ Admin user created successfully');
    
    // Step 4: Log the creation
    const { error: logError } = await supabase
      .from('admin_audit_logs')
      .insert({
        action: 'super_admin_created',
        resource: 'admin_users',
        resource_id: authData.user.id,
        success: true,
        timestamp: new Date().toISOString()
      });
    
    if (logError) {
      console.log('⚠️  Could not log audit event:', logError.message);
    }
    
    console.log('\n🎉 SUPER ADMIN USER CREATED SUCCESSFULLY!');
    console.log('==========================================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: super_admin`);
    console.log(`Status: active`);
    console.log('\nYou can now login to the EduFam admin dashboard with these credentials.');
    
    // Verify the user was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (verifyError) {
      console.log('⚠️  Could not verify user creation:', verifyError.message);
    } else {
      console.log('\n✅ Verification: User found in database');
      console.log(`   - ID: ${verifyData.id}`);
      console.log(`   - Active: ${verifyData.is_active}`);
      console.log(`   - Role: ${verifyData.role}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
  }
}

createSuperAdminDirect(); 