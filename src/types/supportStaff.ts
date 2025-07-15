export type SupportStaffRole = 
  | 'Driver'
  | 'Receptionist'
  | 'Cleaner'
  | 'Secretary'
  | 'Chef'
  | 'Nurse'
  | 'Watchman'
  | 'Librarian'
  | 'Support Staff';

export type EmploymentType = 'permanent' | 'contract' | 'temporary';

export interface SupportStaff {
  id: string;
  school_id: string;
  employee_id: string;
  full_name: string;
  role_title: SupportStaffRole;
  department?: string;
  profile_photo_url?: string;
  salary_amount?: number;
  salary_currency: string;
  employment_type: EmploymentType;
  phone?: string;
  email?: string;
  address?: string;
  date_of_hire: string;
  supervisor_id?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  supervisor?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface CreateSupportStaffData {
  full_name: string;
  role_title: SupportStaffRole;
  department?: string;
  salary_amount?: number;
  salary_currency?: string;
  employment_type: EmploymentType;
  phone?: string;
  email?: string;
  address?: string;
  date_of_hire: string;
  supervisor_id?: string;
  notes?: string;
  profile_photo?: File;
}

export interface UpdateSupportStaffData extends Partial<CreateSupportStaffData> {
  is_active?: boolean;
}

export interface SupportStaffFilters {
  role_title?: SupportStaffRole;
  employment_type?: EmploymentType;
  is_active?: boolean;
  department?: string;
  search?: string;
}

export const SUPPORT_STAFF_ROLES: SupportStaffRole[] = [
  'Driver',
  'Receptionist',
  'Cleaner',
  'Secretary',
  'Chef',
  'Nurse',
  'Watchman',
  'Librarian',
  'Support Staff'
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' }
];

export const COMMON_DEPARTMENTS = [
  'Administration',
  'Security',
  'Transport',
  'Kitchen',
  'Maintenance',
  'Health',
  'Library',
  'General Support'
];