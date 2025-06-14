
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserCheck, setLastUserCheck] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchSchools = useCallback(async () => {
    if (!user || authLoading) {
      console.log('🏫 SchoolProvider: No user or auth loading, clearing schools');
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate fetches for the same user
    if (lastUserCheck === user.id) {
      console.log('🏫 SchoolProvider: Already fetched for this user, skipping');
      return;
    }

    try {
      setIsLoading(true);
      setLastUserCheck(user.id);
      console.log('🏫 SchoolProvider: Fetching schools for user', user.email, 'role:', user.role);
      
      let query = supabase.from('schools').select('*');
      
      if (user?.role === 'edufam_admin') {
        console.log('🏫 SchoolProvider: Admin user, fetching all schools');
      } else {
        if (user?.school_id) {
          console.log('🏫 SchoolProvider: Non-admin user, filtering by school_id:', user.school_id);
          query = query.eq('id', user.school_id);
        } else {
          console.log('🏫 SchoolProvider: User has no school_id, clearing schools');
          setSchools([]);
          setCurrentSchool(null);
          setIsLoading(false);
          return;
        }
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        console.error('🏫 SchoolProvider: Error fetching schools:', error);
        // Don't throw here, just log and continue with empty data
        setSchools([]);
        setCurrentSchool(null);
        toast({
          title: "Warning",
          description: "Could not load schools data. Some features may be limited.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('🏫 SchoolProvider: Fetched schools:', data?.length || 0);
      setSchools(data || []);
      
      // Set current school logic
      if (user?.school_id && data) {
        const userSchool = data.find(school => school.id === user.school_id);
        if (userSchool) {
          console.log('🏫 SchoolProvider: Setting current school:', userSchool.name);
          setCurrentSchool(userSchool);
        }
      } else if (data && data.length === 1) {
        console.log('🏫 SchoolProvider: Setting single school as current:', data[0].name);
        setCurrentSchool(data[0]);
      }
      
    } catch (error) {
      console.error('🏫 SchoolProvider: Error fetching schools:', error);
      setSchools([]);
      setCurrentSchool(null);
      toast({
        title: "Error",
        description: "Failed to fetch schools data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, user?.school_id, user?.email, authLoading, toast, lastUserCheck]);

  useEffect(() => {
    console.log('🏫 SchoolProvider: Auth state changed', { 
      authLoading, 
      hasUser: !!user, 
      userEmail: user?.email,
      userRole: user?.role,
      userSchoolId: user?.school_id,
      lastUserCheck
    });

    // Reset last user check when user changes
    if (!user) {
      setLastUserCheck(null);
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
      return;
    }

    // Only fetch schools when auth is complete, we have a user, and haven't fetched for this user yet
    if (!authLoading && user && lastUserCheck !== user.id) {
      // Add a small delay to ensure auth state has stabilized
      const timeoutId = setTimeout(() => {
        fetchSchools();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, authLoading, fetchSchools, lastUserCheck]);

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
