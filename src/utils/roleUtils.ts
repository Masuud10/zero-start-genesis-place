
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export const determineUserRole = (authUser: User, profileRole?: string): UserRole => {
  console.log('🔍 RoleUtils: Determining role for user', authUser.email, {
    profileRole,
    userMetadataRole: authUser.user_metadata?.role,
    appMetadataRole: authUser.app_metadata?.role,
    email: authUser.email
  });

  // Priority 1: Use profile role if it exists and is valid
  if (profileRole && isValidRole(profileRole)) {
    console.log('🔍 RoleUtils: Using profile role:', profileRole);
    return normalizeRole(profileRole) as UserRole;
  }

  // Priority 2: Use user_metadata role if it exists and is valid
  if (authUser.user_metadata?.role && isValidRole(authUser.user_metadata.role)) {
    console.log('🔍 RoleUtils: Using user_metadata role:', authUser.user_metadata.role);
    return normalizeRole(authUser.user_metadata.role) as UserRole;
  }

  // Priority 3: Use app_metadata role if it exists and is valid
  if (authUser.app_metadata?.role && isValidRole(authUser.app_metadata.role)) {
    console.log('🔍 RoleUtils: Using app_metadata role:', authUser.app_metadata.role);
    return normalizeRole(authUser.app_metadata.role) as UserRole;
  }

  // Priority 4: Determine role based on email patterns
  const emailBasedRole = determineRoleFromEmail(authUser.email || '');
  console.log('🔍 RoleUtils: Using email-based role:', emailBasedRole);
  return emailBasedRole;
};

const normalizeRole = (role: string): string => {
  // Normalize role formatting
  const normalized = role.toLowerCase().trim();
  
  // Handle common variations
  const roleMap = {
    'schoolowner': 'school_owner',
    'school-owner': 'school_owner',
    'school owner': 'school_owner',
    'financeofficer': 'finance_officer',
    'finance-officer': 'finance_officer',
    'finance officer': 'finance_officer',
    'edufamadmin': 'edufam_admin',
    'edufam-admin': 'edufam_admin',
    'edufam admin': 'edufam_admin',
    'elimishaadmin': 'edufam_admin',
    'elimisha-admin': 'edufam_admin',
    'elimisha admin': 'edufam_admin',
    'admin': 'edufam_admin'
  };
  
  return roleMap[normalized] || normalized;
};

const isValidRole = (role: string): boolean => {
  const normalizedRole = normalizeRole(role);
  const validRoles: UserRole[] = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'];
  return validRoles.includes(normalizedRole as UserRole);
};

const determineRoleFromEmail = (email: string): UserRole => {
  const emailLower = email.toLowerCase();
  
  // System admin patterns - check for both elimisha and edufam admin patterns
  if (emailLower.includes('@elimisha.com') || 
      emailLower === 'masuud@gmail.com' ||
      emailLower.includes('elimisha') ||
      emailLower.includes('edufam') ||
      emailLower.includes('admin@')) {
    return 'edufam_admin';
  }
  
  // School role patterns
  if (emailLower.includes('principal')) {
    return 'principal';
  }
  
  if (emailLower.includes('teacher')) {
    return 'teacher';
  }
  
  if (emailLower.includes('owner')) {
    return 'school_owner';
  }
  
  if (emailLower.includes('finance')) {
    return 'finance_officer';
  }
  
  // Default to parent
  return 'parent';
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'edufam_admin':
      return 'EduFam Admin';
    case 'school_owner':
      return 'School Owner';
    case 'principal':
      return 'Principal';
    case 'teacher':
      return 'Teacher';
    case 'finance_officer':
      return 'Finance Officer';
    case 'parent':
      return 'Parent';
    default:
      return role;
  }
};

export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'edufam_admin':
      return 'bg-blue-100 text-blue-800';
    case 'school_owner':
      return 'bg-green-100 text-green-800';
    case 'principal':
      return 'bg-orange-100 text-orange-800';
    case 'teacher':
      return 'bg-cyan-100 text-cyan-800';
    case 'finance_officer':
      return 'bg-yellow-100 text-yellow-800';
    case 'parent':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
