// Temporary script to create HR user
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lmqyizrnuahkmwauonqr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlpenJudWFoa213YXVvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDI0MDgsImV4cCI6MjA2NTAxODQwOH0.w5uRNb2D6Fy7U3mZmwSRoE81BajGa1Us5TcF2t6C4AM'
)

async function createHRUser() {
  try {
    console.log('Creating HR user...');
    
    const { data, error } = await supabase.functions.invoke('create-hr-user', {
      body: {}
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Success:', data);
    
    if (data.success) {
      console.log('✅ HR user created successfully!');
      console.log('📧 Email:', data.email);
      console.log('👤 Role:', data.role);
      console.log('🆔 User ID:', data.user_id);
    } else {
      console.error('❌ Failed:', data.error);
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

createHRUser();