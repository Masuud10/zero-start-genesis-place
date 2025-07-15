import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export const useTransportRoutes = () => {
  return useQuery({
    queryKey: ['transport-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .order('route_name', { ascending: true });

      if (error) throw error;
      return data as TransportRoute[];
    },
  });
};

export const useTransportVehicles = () => {
  return useQuery({
    queryKey: ['transport-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transport_vehicles')
        .select('*')
        .order('vehicle_name', { ascending: true });

      if (error) throw error;
      return data as TransportVehicle[];
    },
  });
};

export const useStudentTransportAssignments = () => {
  return useQuery({
    queryKey: ['student-transport-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_transport_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudentTransportAssignment[];
    },
  });
};