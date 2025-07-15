import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarIcon, Upload, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { CreateSupportStaffData, SUPPORT_STAFF_ROLES, EMPLOYMENT_TYPES, COMMON_DEPARTMENTS } from '@/types/supportStaff';
import { SupportStaffService } from '@/services/supportStaffService';

const staffSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role_title: z.enum(SUPPORT_STAFF_ROLES as [string, ...string[]]),
  department: z.string().optional(),
  salary_amount: z.number().positive('Salary must be positive').optional(),
  salary_currency: z.string().default('KES'),
  employment_type: z.enum(['permanent', 'contract', 'temporary']),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  date_of_hire: z.date(),
  supervisor_id: z.string().optional(),
  notes: z.string().optional()
});

type StaffFormData = z.infer<typeof staffSchema>;

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded: () => void;
}

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  onStaffAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<{ id: string; name: string; role: string }[]>([]);
  const { toast } = useToast();

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      full_name: '',
      role_title: 'Support Staff',
      department: '',
      salary_currency: 'KES',
      employment_type: 'permanent',
      phone: '',
      email: '',
      address: '',
      date_of_hire: new Date(),
      supervisor_id: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (open) {
      fetchSupervisors();
    }
  }, [open]);

  const fetchSupervisors = async () => {
    try {
      const supervisorData = await SupportStaffService.getSupervisors();
      setSupervisors(supervisorData);
    } catch (error) {
      toast({
        title: 'Warning',
        description: 'Could not load supervisors list',
        variant: 'destructive'
      });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      setLoading(true);
      
      const staffData: CreateSupportStaffData = {
        full_name: data.full_name,
        role_title: data.role_title,
        department: data.department,
        salary_amount: data.salary_amount,
        salary_currency: data.salary_currency,
        employment_type: data.employment_type,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address,
        date_of_hire: format(data.date_of_hire, 'yyyy-MM-dd'),
        supervisor_id: data.supervisor_id,
        notes: data.notes,
        profile_photo: profilePhoto || undefined
      };

      await SupportStaffService.createSupportStaff(staffData);
      
      toast({
        title: 'Success',
        description: 'Staff member added successfully'
      });
      
      onStaffAdded();
      form.reset();
      setProfilePhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add staff member',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                  <Upload className="h-4 w-4" />
                  <span>Upload Photo</span>
                </div>
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. JPG, PNG up to 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...form.register('full_name')}
                placeholder="Enter full name"
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role_title">Role *</Label>
              <Select
                value={form.watch('role_title')}
                onValueChange={(value) => form.setValue('role_title', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_STAFF_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={form.watch('department') || ''}
                onValueChange={(value) => form.setValue('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employment Type */}
            <div>
              <Label htmlFor="employment_type">Employment Type *</Label>
              <Select
                value={form.watch('employment_type')}
                onValueChange={(value) => form.setValue('employment_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date of Hire */}
            <div>
              <Label>Date of Hire *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('date_of_hire') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('date_of_hire') ? (
                      format(form.watch('date_of_hire'), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch('date_of_hire')}
                    onSelect={(date) => date && form.setValue('date_of_hire', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Salary */}
            <div>
              <Label htmlFor="salary_amount">Salary Amount</Label>
              <Input
                id="salary_amount"
                type="number"
                {...form.register('salary_amount', { valueAsNumber: true })}
                placeholder="Enter salary"
              />
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="salary_currency">Currency</Label>
              <Select
                value={form.watch('salary_currency')}
                onValueChange={(value) => form.setValue('salary_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="Enter phone number"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Supervisor */}
            <div className="col-span-2">
              <Label htmlFor="supervisor_id">Supervisor</Label>
              <Select
                value={form.watch('supervisor_id') || ''}
                onValueChange={(value) => form.setValue('supervisor_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map(supervisor => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} ({supervisor.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...form.register('address')}
                placeholder="Enter address"
                rows={2}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};