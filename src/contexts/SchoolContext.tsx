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
  curriculum_type?: string; // fix: allow curriculum_type from DB
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

  const { user } = useAuth();

  console.log('🏫 SchoolProvider: Initializing with user:', {
    hasUser: !!user,
    userRole: user?.role,
    userSchoolId: user?.school_id,
    userEmail: user?.email
  });

  const fetchSchools = async () => {
    if (!user) {
      console.log('🏫 SchoolProvider: No authenticated user, clearing state');
      setIsLoading(false);
      setSchools([]);
      setCurrentSchool(null);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🏫 SchoolProvider: Fetching schools for user role:', user.role, 'school_id:', user.school_id);

      // For system admins, fetch all schools
      if (user.role === 'elimisha_admin' || user.role === 'edufam_admin') {
        const { data, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .order('name');

        if (fetchError) {
          console.error('🏫 SchoolProvider: Admin school fetch error:', fetchError);
          throw fetchError;
        }
        
        setSchools(data || []);
        console.log('🏫 SchoolProvider: Fetched', data?.length || 0, 'schools for admin');
      } 
      // For school-specific users, fetch their school
      else if (user.school_id) {
        const { data, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', user.school_id)
          .maybeSingle();

        if (fetchError) {
          console.warn('🏫 SchoolProvider: School fetch error:', fetchError);
          setSchools([]);
          setCurrentSchool(null);
          setError(`Failed to fetch school: ${fetchError.message}`);
        } else if (data) {
          setSchools([data]);
          setCurrentSchool(data);
          console.log('🏫 SchoolProvider: Fetched user school:', data.name);
        } else {
          console.warn('🏫 SchoolProvider: User school not found:', user.school_id);
          setSchools([]);
          setCurrentSchool(null);
          setError('Your assigned school was not found. Please contact your administrator.');
        }
      } else {
        console.log('🏫 SchoolProvider: User has no school assignment');
        setSchools([]);
        setCurrentSchool(null);
        setError(null);
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
    if (user?.id) {
      console.log('🏫 SchoolProvider: User authenticated, fetching schools');
      fetchSchools();
    } else {
      console.log('🏫 SchoolProvider: No user, clearing schools');
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id, user?.role, user?.school_id]);

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
