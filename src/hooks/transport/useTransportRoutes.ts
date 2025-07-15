import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransportRoute {
  id: number;
  school_id: string;
  route_name: string;
  route_description?: string;
  monthly_fee: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRouteData {
  route_name: string;
  route_description?: string;
  monthly_fee: number;
}

export interface UpdateRouteData extends Partial<CreateRouteData> {}

export const useTransportRoutes = () => {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all routes for the current school
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .order('route_name');

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transport routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new route
  const createRoute = async (routeData: CreateRouteData): Promise<boolean> => {
    try {
      // Get current user's school_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.school_id) {
        throw new Error('User school not found');
      }

      const { error } = await supabase
        .from('transport_routes')
        .insert([{ ...routeData, school_id: profile.school_id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport route created successfully",
      });
      
      await fetchRoutes(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: "Error",
        description: "Failed to create transport route",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update an existing route
  const updateRoute = async (id: number, updateData: UpdateRouteData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transport_routes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport route updated successfully",
      });
      
      await fetchRoutes(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update transport route",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a route
  const deleteRoute = async (id: number): Promise<boolean> => {
    try {
      // Check if route has assigned vehicles or students
      const [vehiclesCheck, studentsCheck] = await Promise.all([
        supabase
          .from('transport_vehicles')
          .select('id')
          .eq('assigned_route_id', id)
          .limit(1),
        supabase
          .from('student_transport_assignments')
          .select('id')
          .eq('route_id', id)
          .eq('is_active', true)
          .limit(1)
      ]);

      if (vehiclesCheck.data && vehiclesCheck.data.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This route has assigned vehicles. Please reassign them first.",
          variant: "destructive",
        });
        return false;
      }

      if (studentsCheck.data && studentsCheck.data.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This route has assigned students. Please reassign them first.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('transport_routes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport route deleted successfully",
      });
      
      await fetchRoutes(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete transport route",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return {
    routes,
    loading,
    createRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes: fetchRoutes,
  };
};