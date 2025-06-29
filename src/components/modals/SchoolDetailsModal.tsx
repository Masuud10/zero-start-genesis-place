
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, Phone, Mail, Calendar, Users, GraduationCap, Hash, AlertCircle } from 'lucide-react';

interface SchoolDetailsModalProps {
  school: any;
  isOpen: boolean;
  onClose: () => void;
}

const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({
  school,
  isOpen,
  onClose
}) => {
  if (!school) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const formatCurriculumType = (type?: string) => {
    switch (type) {
      case 'cbc':
        return 'CBC';
      case 'igcse':
        return 'IGCSE';
      case 'cambridge':
        return 'Cambridge';
      case 'ib':
        return 'International Baccalaureate';
      default:
        return type || 'Standard';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {school.logo_url ? (
              <img 
                src={school.logo_url} 
                alt={`${school.name} logo`}
                className="w-12 h-12 rounded-lg object-cover border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{school.name}</h2>
              {school.motto && (
                <p className="text-sm text-blue-600 italic">"{school.motto}"</p>
              )}
              {school.status && (
                <Badge className={`mt-1 ${getStatusColor(school.status)}`}>
                  {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {school.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-gray-600">{school.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {school.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{school.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {school.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{school.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm text-gray-600">{formatDate(school.created_at)}</p>
                    </div>
                  </div>
                  
                  {school.curriculum_type && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Curriculum Type</p>
                        <Badge variant="outline">{formatCurriculumType(school.curriculum_type)}</Badge>
                      </div>
                    </div>
                  )}
                  
                  {school.registration_number && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Registration Number</p>
                        <p className="text-sm text-gray-600">{school.registration_number}</p>
                      </div>
                    </div>
                  )}

                  {school.school_type && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">School Type</p>
                        <Badge variant="outline">
                          {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(school.year_established || school.principal_name || school.website_url || school.max_students || school.subscription_plan) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {school.year_established && (
                    <div>
                      <p className="text-sm font-medium">Year Established</p>
                      <p className="text-sm text-gray-600">{school.year_established}</p>
                    </div>
                  )}
                  
                  {school.principal_name && (
                    <div>
                      <p className="text-sm font-medium">Principal</p>
                      <p className="text-sm text-gray-600">{school.principal_name}</p>
                    </div>
                  )}

                  {school.principal_contact && (
                    <div>
                      <p className="text-sm font-medium">Principal Contact</p>
                      <p className="text-sm text-gray-600">{school.principal_contact}</p>
                    </div>
                  )}

                  {school.principal_email && (
                    <div>
                      <p className="text-sm font-medium">Principal Email</p>
                      <p className="text-sm text-gray-600">{school.principal_email}</p>
                    </div>
                  )}
                  
                  {school.website_url && (
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a 
                        href={school.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  {school.slogan && (
                    <div>
                      <p className="text-sm font-medium">Slogan</p>
                      <p className="text-sm text-gray-600">{school.slogan}</p>
                    </div>
                  )}

                  {school.max_students && (
                    <div>
                      <p className="text-sm font-medium">Maximum Students</p>
                      <p className="text-sm text-gray-600">{school.max_students.toLocaleString()}</p>
                    </div>
                  )}

                  {school.subscription_plan && (
                    <div>
                      <p className="text-sm font-medium">Subscription Plan</p>
                      <Badge variant="outline">
                        {school.subscription_plan.charAt(0).toUpperCase() + school.subscription_plan.slice(1)}
                      </Badge>
                    </div>
                  )}

                  {school.timezone && (
                    <div>
                      <p className="text-sm font-medium">Timezone</p>
                      <p className="text-sm text-gray-600">{school.timezone}</p>
                    </div>
                  )}

                  {school.term_structure && (
                    <div>
                      <p className="text-sm font-medium">Term Structure</p>
                      <p className="text-sm text-gray-600">{school.term_structure}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Information */}
          {school.owner_information && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Owner Information</h3>
                <p className="text-sm text-gray-600">{school.owner_information}</p>
              </CardContent>
            </Card>
          )}

          {/* Error State for Missing Data */}
          {!school.name && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Some school information may be incomplete or unavailable.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailsModal;
