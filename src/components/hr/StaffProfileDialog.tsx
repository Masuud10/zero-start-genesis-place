import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Briefcase, 
  DollarSign,
  UserCheck,
  FileText,
  Archive,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { SupportStaff } from '@/types/supportStaff';
import { SupportStaffService } from '@/services/supportStaffService';
import { useToast } from '@/hooks/use-toast';
import { EditStaffDialog } from './EditStaffDialog';

interface StaffProfileDialogProps {
  staff: SupportStaff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffUpdated: () => void;
}

export const StaffProfileDialog: React.FC<StaffProfileDialogProps> = ({
  staff,
  open,
  onOpenChange,
  onStaffUpdated
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleArchiveToggle = async () => {
    try {
      setLoading(true);
      if (staff.is_active) {
        await SupportStaffService.archiveSupportStaff(staff.id);
        toast({
          title: 'Success',
          description: 'Staff member archived successfully'
        });
      } else {
        await SupportStaffService.reactivateSupportStaff(staff.id);
        toast({
          title: 'Success',
          description: 'Staff member reactivated successfully'
        });
      }
      onStaffUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update staff status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComplete = () => {
    setShowEditDialog(false);
    onStaffUpdated();
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'permanent':
        return 'bg-green-100 text-green-800';
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'temporary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Staff Profile</DialogTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant={staff.is_active ? "destructive" : "default"}
                  size="sm"
                  onClick={handleArchiveToggle}
                  disabled={loading}
                >
                  {staff.is_active ? (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reactivate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={staff.profile_photo_url} />
                <AvatarFallback className="text-lg">
                  {staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-semibold">{staff.full_name}</h2>
                  {!staff.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">ID: {staff.employee_id}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{staff.role_title}</Badge>
                  <Badge 
                    className={getEmploymentTypeColor(staff.employment_type)}
                    variant="secondary"
                  >
                    {staff.employment_type}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.phone}</span>
                  </div>
                )}
                {staff.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.email}</span>
                  </div>
                )}
              </div>
              {staff.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{staff.address}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Employment Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <p>{staff.department || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Date of Hire</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(staff.date_of_hire), 'PPP')}</span>
                  </div>
                </div>
                {staff.salary_amount && (
                  <div>
                    <Label>Salary</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {staff.salary_currency} {staff.salary_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                {staff.supervisor && (
                  <div>
                    <Label>Supervisor</Label>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {staff.supervisor.name} ({staff.supervisor.role})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {staff.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Notes
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {staff.notes}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Metadata */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {format(new Date(staff.created_at), 'PPP p')}</p>
              <p>Last Updated: {format(new Date(staff.updated_at), 'PPP p')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditStaffDialog
          staff={staff}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onStaffUpdated={handleEditComplete}
        />
      )}
    </>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-sm font-medium text-muted-foreground">{children}</label>
);