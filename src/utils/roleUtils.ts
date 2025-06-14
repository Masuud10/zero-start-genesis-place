
import { User } from '@supabase/supabase-js';

// Helper function to determine user role with improved logic
export const determineUserRole = (authUser: User, profileRole?: string): string => {
  console.log('👤 Determining role for user:', authUser.email, 'profile role:', profileRole, 'metadata:', authUser.user_metadata, 'app_metadata:', authUser.app_metadata);

  // Priority 1: Use role from profile if available and valid
  if (profileRole && profileRole !== 'parent') {
    console.log('👤 Using profile role:', profileRole);
    return profileRole;
  }

  // Priority 2: Use role from user_metadata if available
  const metadataRole = authUser.user_metadata?.role;
  if (metadataRole && metadataRole !== 'parent') {
    console.log('👤 Using user_metadata role:', metadataRole);
    return metadataRole;
  }

  // Priority 3: Use role from app_metadata if available
  const appMetadataRole = authUser.app_metadata?.role;
  if (appMetadataRole && appMetadataRole !== 'parent') {
    console.log('👤 Using app_metadata role:', appMetadataRole);
    return appMetadataRole;
  }

  // Priority 4: Determine from email patterns (only if no other role found)
  const email = authUser.email?.toLowerCase() || '';
  
  if (email.includes('@edufam') || email === 'masuud@gmail.com') {
    console.log('👤 Assigning edufam_admin role based on email pattern');
    return 'edufam_admin';
  }
  
  if (email.includes('admin') && !email.includes('parent')) {
    console.log('👤 Assigning edufam_admin role based on email pattern');
    return 'edufam_admin';
  }
  
  if (email.includes('principal') && !email.includes('parent')) {
    console.log('👤 Assigning principal role based on email pattern');
    return 'principal';
  }
  
  if (email.includes('teacher') && !email.includes('parent')) {
    console.log('👤 Assigning teacher role based on email pattern');
    return 'teacher';
  }
  
  if (email.includes('owner') && !email.includes('parent')) {
    console.log('👤 Assigning school_owner role based on email pattern');
    return 'school_owner';
  }
  
  if (email.includes('finance') && !email.includes('parent')) {
    console.log('👤 Assigning finance_officer role based on email pattern');
    return 'finance_officer';
  }

  // Default to parent only if no other role could be determined
  console.log('👤 Defaulting to parent role for:', email);
  return 'parent';
};
