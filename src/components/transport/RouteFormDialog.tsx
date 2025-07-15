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
import { Textarea } from '@/components/ui/textarea';
import { useTransportRoutes, TransportRoute, CreateRouteData } from '@/hooks/transport/useTransportRoutes';

interface RouteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: TransportRoute | null;
  onSuccess: () => void;
}

export const RouteFormDialog = ({ open, onOpenChange, route, onSuccess }: RouteFormDialogProps) => {
  const { createRoute, updateRoute } = useTransportRoutes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRouteData>({
    route_name: '',
    route_description: '',
    monthly_fee: 0,
  });

  const isEditing = !!route;

  useEffect(() => {
    if (route) {
      setFormData({
        route_name: route.route_name,
        route_description: route.route_description || '',
        monthly_fee: route.monthly_fee,
      });
    } else {
      setFormData({
        route_name: '',
        route_description: '',
        monthly_fee: 0,
      });
    }
  }, [route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;
      
      if (isEditing && route) {
        success = await updateRoute(route.id, formData);
      } else {
        success = await createRoute(formData);
      }

      if (success) {
        onSuccess();
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
            {isEditing ? 'Edit Transport Route' : 'Add New Transport Route'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the transport route details below.' 
              : 'Create a new transport route for your school.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="route_name">Route Name *</Label>
              <Input
                id="route_name"
                value={formData.route_name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  route_name: e.target.value 
                }))}
                placeholder="e.g., Route A - Westlands"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="route_description">Description</Label>
              <Textarea
                id="route_description"
                value={formData.route_description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  route_description: e.target.value 
                }))}
                placeholder="Brief description of the route and areas covered"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monthly_fee">Monthly Fee (KSH) *</Label>
              <Input
                id="monthly_fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_fee}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  monthly_fee: parseFloat(e.target.value) || 0 
                }))}
                placeholder="e.g., 2500.00"
                required
              />
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
              {loading ? 'Saving...' : (isEditing ? 'Update Route' : 'Create Route')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};