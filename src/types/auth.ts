export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  school_id?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  // Supabase auth metadata
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  // Security properties
  mfa_enabled?: boolean;
  last_login_at?: string;
  last_login_ip?: string;
}

// Add User as an alias for AuthUser for backward compatibility
export type User = AuthUser;

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  strictValidation?: boolean;
  accessType?: 'school' | 'admin';
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized?: boolean;
  signIn: (credentials: LoginCredentials) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}
