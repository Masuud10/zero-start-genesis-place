
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  role?: string;
  name?: string;
  school_id?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}
