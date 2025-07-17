import React, { createContext, useContext, ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { User, Session } from '@supabase/supabase-js';
import { AdminUser, AdminRole } from '@/types/admin';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: AdminRole | AdminRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuthContext = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const authData = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={authData}>
      {children}
    </AdminAuthContext.Provider>
  );
};