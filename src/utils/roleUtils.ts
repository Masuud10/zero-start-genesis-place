
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
    const normalizedRole = normalizeRole(profileRole);
    console.log('🔍 RoleUtils: Using profile role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 2: Use user_metadata role if it exists and is valid
  if (authUser.user_metadata?.role && isValidRole(authUser.user_metadata.role)) {
    const normalizedRole = normalizeRole(authUser.user_metadata.role);
    console.log('🔍 RoleUtils: Using user_metadata role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 3: Use app_metadata role if it exists and is valid
  if (authUser.app_metadata?.role && isValidRole(authUser.app_metadata.role)) {
    const normalizedRole = normalizeRole(authUser.app_metadata.role);
    console.log('🔍 RoleUtils: Using app_metadata role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 4: Determine role based on email patterns
  const emailBasedRole = determineRoleFromEmail(authUser.email || '');
  console.log('🔍 RoleUtils: Using email-based role:', emailBasedRole);
  return emailBasedRole;
};

const normalizeRole = (role: string): string => {
  if (!role || typeof role !== 'string') {
    console.warn('🔍 RoleUtils: Invalid role provided for normalization:', role);
    return 'parent';
  }

  // Normalize role formatting and handle common variations
  const normalized = role.toLowerCase().trim().replace(/[_\s-]/g, '');
  
  // Handle common role variations and map them to standard roles
  const roleMap: { [key: string]: string } = {
    // School owner variations
    'schoolowner': 'school_owner',
    'owner': 'school_owner',
    
    // Finance officer variations
    'financeofficer': 'finance_officer',
    'finance': 'finance_officer',
    
    // Admin variations - all map to edufam_admin
    'edufamadmin': 'edufam_admin',
    'elimishaadmin': 'edufam_admin',
    'admin': 'edufam_admin',
    'systemadmin': 'edufam_admin',
    'superadmin': 'edufam_admin',
    
    // Standard roles (no change needed)
    'principal': 'principal',
    'teacher': 'teacher',
    'parent': 'parent'
  };
  
  const mappedRole = roleMap[normalized] || normalized;
  console.log('🔍 RoleUtils: Role normalized from', role, 'to', mappedRole);
  return mappedRole;
};

const isValidRole = (role: string): boolean => {
  if (!role || typeof role !== 'string') {
    console.warn('🔍 RoleUtils: Invalid role type for validation:', typeof role, role);
    return false;
  }

  const normalizedRole = normalizeRole(role);
  const validRoles: UserRole[] = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'];
  const isValid = validRoles.includes(normalizedRole as UserRole);
  
  console.log('🔍 RoleUtils: Role validation for', role, '(normalized:', normalizedRole, ') =', isValid);
  return isValid;
};

const determineRoleFromEmail = (email: string): UserRole => {
  if (!email || typeof email !== 'string') {
    console.warn('🔍 RoleUtils: Invalid email for role determination:', email);
    return 'parent';
  }

  const emailLower = email.toLowerCase();
  
  // System admin patterns - check for both elimisha and edufam admin patterns
  if (emailLower.includes('@elimisha.com') || 
      emailLower === 'masuud@gmail.com' ||
      emailLower.includes('elimisha') ||
      emailLower.includes('edufam') ||
      emailLower.includes('admin@')) {
    console.log('🔍 RoleUtils: Email matches admin pattern:', email);
    return 'edufam_admin';
  }
  
  // School role patterns
  if (emailLower.includes('principal')) {
    console.log('🔍 RoleUtils: Email matches principal pattern:', email);
    return 'principal';
  }
  
  if (emailLower.includes('teacher')) {
    console.log('🔍 RoleUtils: Email matches teacher pattern:', email);
    return 'teacher';
  }
  
  if (emailLower.includes('owner')) {
    console.log('🔍 RoleUtils: Email matches owner pattern:', email);
    return 'school_owner';
  }
  
  if (emailLower.includes('finance')) {
    console.log('🔍 RoleUtils: Email matches finance pattern:', email);
    return 'finance_officer';
  }
  
  // Default to parent
  console.log('🔍 RoleUtils: Email matches no patterns, defaulting to parent:', email);
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
