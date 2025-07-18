import { createClient } from '@supabase/supabase-js';

// Script to create a super admin user
async function createSuperAdmin() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Super Admin User...\n');
    
    // Check if super admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'super_admin')
      .eq('is_active', true);
    
    if (checkError) {
      console.error('❌ Error checking existing admins:', checkError.message);
      return;
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✅ Super admin users already exist:');
      existingAdmins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.name})`);
      });
      console.log('\nNo need to create a new super admin user.');
      return;
    }
    
    console.log('❌ No active super admin users found. Creating one...\n');
    
    // Get user input for super admin details
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve);
      });
    };
    
    const email = await question('Enter email for super admin: ');
    const name = await question('Enter name for super admin: ');
    const password = await question('Enter password for super admin: ');
    
    rl.close();
    
    if (!email || !name || !password) {
      console.log('❌ All fields are required!');
      return;
    }
    
    console.log('\n🔄 Creating super admin user...');
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
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
    
    // Step 2: Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email.trim(),
        name: name.trim(),
        role: 'super_admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }
    
    console.log('✅ Profile created successfully');
    
    // Step 3: Create admin user
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        email: email.trim(),
        name: name.trim(),
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
      // Try to clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
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
    console.log(`Name: ${name}`);
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

// Alternative: Create super admin with predefined credentials
async function createDefaultSuperAdmin() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Creating Default Super Admin User...\n');
    
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
      return;
    }
    
    console.log('🔄 Creating default super admin...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }
    
    // Create profile
    await supabase
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
    
    // Create admin user
    await supabase
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
    
    console.log('🎉 DEFAULT SUPER ADMIN CREATED!');
    console.log('================================');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nYou can now login to the EduFam admin dashboard.');
    
  } catch (error) {
    console.error('❌ Failed to create default super admin:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--default')) {
  createDefaultSuperAdmin();
} else {
  createSuperAdmin();
} 