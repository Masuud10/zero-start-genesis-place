import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenantQuery } from '@/hooks/useMultiTenantQuery';
import { toast } from 'sonner';

export interface TransportRoute {
  id: number;
  route_name: string;
  route_description: string;
  monthly_fee: number;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransportVehicle {
  id: number;
  vehicle_name: string;
  registration_number: string;
  capacity: number;
  assigned_route_id: number;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentTransportAssignment {
  id: number;
  student_id: string;
  route_id: number;
  assignment_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportAnalytics {
  totalRoutes: number;
  totalVehicles: number;
  studentsUsingTransport: number;
  monthlyRevenue: number;
  routeCoverage: number;
  averageStudentsPerRoute: number;
}

export const useTransportRoutes = () => {
  const { user } = useAuth();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  return useQuery({
    queryKey: ['transport-routes', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const query = createSchoolScopedQuery('transport_routes' as any, '*');
      const { data, error } = await query.order('route_name', { ascending: true });

      if (error) throw error;
      return data as TransportRoute[];
    },
    enabled: !!user?.school_id,
  });
};

export const useTransportVehicles = () => {
  const { user } = useAuth();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  return useQuery({
    queryKey: ['transport-vehicles', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const query = createSchoolScopedQuery('transport_vehicles' as any, `
        *,
        transport_routes!assigned_route_id (
          route_name,
          route_description
        )
      `);
      const { data, error } = await query.order('vehicle_name', { ascending: true });

      if (error) throw error;
      return data as TransportVehicle[];
    },
    enabled: !!user?.school_id,
  });
};

export const useStudentTransportAssignments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-transport-assignments', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('student_transport_assignments')
        .select(`
          *,
          students!inner (
            id,
            name,
            admission_number,
            school_id
          ),
          transport_routes (
            route_name,
            monthly_fee
          )
        `)
        .eq('students.school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudentTransportAssignment[];
    },
    enabled: !!user?.school_id,
  });
};

export const useTransportAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transport-analytics', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      // Get transport routes count
      const { count: routesCount, error: routesError } = await supabase
        .from('transport_routes')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id);

      if (routesError) throw routesError;

      // Get vehicles count
      const { count: vehiclesCount, error: vehiclesError } = await supabase
        .from('transport_vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id);

      if (vehiclesError) throw vehiclesError;

      // Get active student assignments count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('student_transport_assignments')
        .select(`
          students!inner (school_id)
        `, { count: 'exact', head: true })
        .eq('students.school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Calculate monthly revenue from routes and assignments
      const { data: revenueData, error: revenueError } = await supabase
        .from('student_transport_assignments')
        .select(`
          transport_routes!inner (
            monthly_fee
          ),
          students!inner (
            school_id
          )
        `)
        .eq('students.school_id', user.school_id)
        .eq('is_active', true);

      if (revenueError) throw revenueError;

      const monthlyRevenue = revenueData?.reduce((sum, assignment: any) => {
        return sum + (assignment.transport_routes?.monthly_fee || 0);
      }, 0) || 0;

      const averageStudentsPerRoute = routesCount && routesCount > 0 
        ? Math.round((studentsCount || 0) / routesCount) 
        : 0;

      return {
        totalRoutes: routesCount || 0,
        totalVehicles: vehiclesCount || 0,
        studentsUsingTransport: studentsCount || 0,
        monthlyRevenue,
        routeCoverage: routesCount || 0, // This could be more sophisticated with actual area coverage
        averageStudentsPerRoute,
      } as TransportAnalytics;
    },
    enabled: !!user?.school_id,
  });
};