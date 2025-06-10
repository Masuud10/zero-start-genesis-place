
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'school_owner' | 'principal' | 'teacher' | 'parent' | 'finance_officer' | 'edufam_admin' | 'elimisha_admin';
  avatar?: string;
  schoolId?: string;
  isFirstLogin?: boolean;
  emailVerified?: boolean;
}

export type UserRole = 'school_owner' | 'principal' | 'teacher' | 'parent' | 'finance_officer' | 'edufam_admin' | 'elimisha_admin';
