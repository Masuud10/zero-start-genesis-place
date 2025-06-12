
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
}

interface SchoolContextType {
  currentSchool: School | null;
  isLoading: boolean;
  schools: School[];
  fetchSchools: () => Promise<void>;
  setCurrentSchool: (school: School | null) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from('schools').select('*');
      
      // Admin users can see all schools
      if (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') {
        // No additional filtering needed
      } else {
        // Non-admin users only see their own school
        if (user?.school_id) {
          query = query.eq('id', user.school_id);
        } else {
          // User doesn't belong to any school
          setSchools([]);
          setCurrentSchool(null);
          setIsLoading(false);
          return;
        }
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      setSchools(data || []);
      
      // Set current school based on user's school_id
      if (user?.school_id && data) {
        const userSchool = data.find(school => school.id === user.school_id);
        if (userSchool) {
          setCurrentSchool(userSchool);
        }
      } else if (data && data.length === 1) {
        // If user is admin and there's only one school, set it as current
        setCurrentSchool(data[0]);
      }
      
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schools data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchools();
    } else {
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    currentSchool,
    isLoading,
    schools,
    fetchSchools,
    setCurrentSchool
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};
