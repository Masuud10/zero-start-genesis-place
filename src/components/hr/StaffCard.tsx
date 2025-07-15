import React from 'react';
import { Eye, Archive, RotateCcw, Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SupportStaff } from '@/types/supportStaff';
import { format } from 'date-fns';

interface StaffCardProps {
  staff: SupportStaff;
  onView: (staff: SupportStaff) => void;
  onArchive: (id: string, isActive: boolean) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onView,
  onArchive
}) => {
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
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={staff.profile_photo_url} />
              <AvatarFallback>
                {staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{staff.full_name}</h3>
              <p className="text-xs text-muted-foreground">{staff.employee_id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(staff)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(staff.id, staff.is_active)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {staff.is_active ? (
                <Archive className="h-4 w-4" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {staff.role_title}
          </Badge>
          <Badge 
            className={`text-xs ${getEmploymentTypeColor(staff.employment_type)}`}
            variant="secondary"
          >
            {staff.employment_type}
          </Badge>
        </div>

        {staff.department && (
          <p className="text-xs text-muted-foreground">
            Department: {staff.department}
          </p>
        )}

        <div className="space-y-1">
          {staff.phone && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{staff.phone}</span>
            </div>
          )}
          {staff.email && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{staff.email}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Hired {format(new Date(staff.date_of_hire), 'MMM yyyy')}</span>
          </div>
        </div>

        {!staff.is_active && (
          <Badge variant="destructive" className="w-full justify-center text-xs">
            Inactive
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};