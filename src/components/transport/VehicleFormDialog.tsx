import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransportVehicles, TransportVehicle, CreateVehicleData } from '@/hooks/transport/useTransportVehicles';
import { useTransportRoutes } from '@/hooks/transport/useTransportRoutes';

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: TransportVehicle | null;
  onSuccess: () => void;
}

export const VehicleFormDialog = ({ open, onOpenChange, vehicle, onSuccess }: VehicleFormDialogProps) => {
  const { createVehicle, updateVehicle } = useTransportVehicles();
  const { routes } = useTransportRoutes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleData>({
    vehicle_name: '',
    registration_number: '',
    capacity: 0,
    assigned_route_id: undefined,
  });

  const isEditing = !!vehicle;

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicle_name: vehicle.vehicle_name,
        registration_number: vehicle.registration_number,
        capacity: vehicle.capacity,
        assigned_route_id: vehicle.assigned_route_id,
      });
    } else {
      setFormData({
        vehicle_name: '',
        registration_number: '',
        capacity: 0,
        assigned_route_id: undefined,
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;
      
      if (isEditing && vehicle) {
        success = await updateVehicle(vehicle.id, formData);
      } else {
        success = await createVehicle(formData);
      }

      if (success) {
        onSuccess();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the vehicle details below.' 
              : 'Add a new vehicle to your school transport fleet.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle_name">Vehicle Name *</Label>
              <Input
                id="vehicle_name"
                value={formData.vehicle_name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vehicle_name: e.target.value 
                }))}
                placeholder="e.g., Bus 1, Van A"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registration_number">Registration Number *</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  registration_number: e.target.value.toUpperCase() 
                }))}
                placeholder="e.g., KDA 123X"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity (Students) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  capacity: parseInt(e.target.value) || 0 
                }))}
                placeholder="e.g., 40"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assigned_route">Assigned Route</Label>
              <Select 
                value={formData.assigned_route_id ? formData.assigned_route_id.toString() : "none"}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  assigned_route_id: value === "none" ? undefined : parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a route (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Route Assigned</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.route_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Vehicle' : 'Create Vehicle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};