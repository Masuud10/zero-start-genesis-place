
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  school_id?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Add User as an alias for AuthUser for backward compatibility
export type User = AuthUser;

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  role?: string;
  school_id?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<{ error?: string }>;
  signUp: (credentials: SignupCredentials) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}
