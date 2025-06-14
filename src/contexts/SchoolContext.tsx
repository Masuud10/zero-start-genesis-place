
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface SchoolContextType {
  currentSchool: School | null;
  schools: School[];
  isLoading: boolean;
  error: string | null;
  setCurrentSchool: (school: School | null) => void;
  fetchSchools: () => Promise<void>;
  refetch: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth user safely
  const { user: authUser } = useAuth();

  console.log('🏫 SchoolProvider: Initializing with user:', {
    hasUser: !!authUser,
    userRole: authUser?.role,
    userSchoolId: authUser?.school_id
  });

  const fetchSchools = async () => {
    if (!authUser) {
      console.log('🏫 SchoolProvider: No authenticated user, skipping school fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🏫 SchoolProvider: Fetching schools for user role:', authUser.role);

      // For system admins, fetch all schools
      if (authUser.role === 'elimisha_admin' || authUser.role === 'edufam_admin') {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name');

        if (error) throw error;
        
        setSchools(data || []);
        console.log('🏫 SchoolProvider: Fetched', data?.length || 0, 'schools for admin');
      } 
      // For school-specific users, fetch their school
      else if (authUser.school_id) {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', authUser.school_id)
          .maybeSingle();

        if (error) {
          console.warn('🏫 SchoolProvider: School fetch error:', error);
          setSchools([]);
          setCurrentSchool(null);
        } else if (data) {
          setSchools([data]);
          setCurrentSchool(data);
          console.log('🏫 SchoolProvider: Fetched user school:', data.name);
        } else {
          console.warn('🏫 SchoolProvider: User school not found:', authUser.school_id);
          setSchools([]);
          setCurrentSchool(null);
        }
      } else {
        console.log('🏫 SchoolProvider: User has no school assignment');
        setSchools([]);
        setCurrentSchool(null);
      }
    } catch (error: any) {
      console.error('🏫 SchoolProvider: Error fetching schools:', error);
      setError(error.message || 'Failed to fetch schools');
      setSchools([]);
      setCurrentSchool(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = fetchSchools;

  // Effect to fetch schools when user changes
  useEffect(() => {
    if (authUser) {
      console.log('🏫 SchoolProvider: User changed, fetching schools');
      fetchSchools();
    } else {
      console.log('🏫 SchoolProvider: No user, clearing schools');
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
      setError(null);
    }
  }, [authUser?.id, authUser?.role, authUser?.school_id]);

  const value = {
    currentSchool,
    schools,
    isLoading,
    error,
    setCurrentSchool,
    fetchSchools,
    refetch
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};
