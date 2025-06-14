
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  role?: string;
  name?: string;
  school_id?: string;
  avatar_url?: string;
  mfa_enabled?: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  password_changed_at?: string;
  failed_login_attempts?: number;
  locked_until?: string;
}

// Keep the old AuthUser for backward compatibility
export interface AuthUser extends User {}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error?: string | null;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}
