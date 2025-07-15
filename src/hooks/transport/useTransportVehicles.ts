import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransportVehicle {
  id: number;
  school_id: string;
  vehicle_name: string;
  registration_number: string;
  capacity: number;
  assigned_route_id?: number;
  created_at: string;
  updated_at: string;
  // Joined data from route
  route_name?: string;
}

export interface CreateVehicleData {
  vehicle_name: string;
  registration_number: string;
  capacity: number;
  assigned_route_id?: number;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {}

export const useTransportVehicles = () => {
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all vehicles for the current school
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transport_vehicles')
        .select(`
          *,
          transport_routes!assigned_route_id (
            route_name
          )
        `)
        .order('vehicle_name');

      if (error) throw error;
      
      const mappedData = data?.map((vehicle: any) => ({
        ...vehicle,
        route_name: vehicle.transport_routes?.route_name || undefined
      })) || [];
      
      setVehicles(mappedData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transport vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new vehicle
  const createVehicle = async (vehicleData: CreateVehicleData): Promise<boolean> => {
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
        .from('transport_vehicles')
        .insert([{ ...vehicleData, school_id: profile.school_id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport vehicle created successfully",
      });
      
      await fetchVehicles(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.message.includes('registration_number')) {
        toast({
          title: "Error",
          description: "A vehicle with this registration number already exists",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create transport vehicle",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: number, updateData: UpdateVehicleData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transport_vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport vehicle updated successfully",
      });
      
      await fetchVehicles(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505' && error.message.includes('registration_number')) {
        toast({
          title: "Error",
          description: "A vehicle with this registration number already exists",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update transport vehicle",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transport_vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transport vehicle deleted successfully",
      });
      
      await fetchVehicles(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to delete transport vehicle",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    refreshVehicles: fetchVehicles,
  };
};