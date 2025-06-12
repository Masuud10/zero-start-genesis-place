import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  role?: string;
  name?: string;
  school_id?: string;
  avatar_url?: string;
}

// Keep the old AuthUser for backward compatibility
export interface AuthUser extends User {}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}
