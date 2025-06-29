
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, Phone, Mail, Calendar, Users, GraduationCap, Hash } from 'lucide-react';

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
      default:
        return type || 'Standard';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {school.logo_url ? (
              <img 
                src={school.logo_url} 
                alt={`${school.name} logo`}
                className="w-12 h-12 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{school.name}</h2>
              {school.motto && (
                <p className="text-sm text-blue-600 italic">"{school.motto}"</p>
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
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-600">{school.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{school.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{school.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm text-gray-600">{formatDate(school.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Curriculum Type</p>
                      <Badge variant="outline">{formatCurriculumType(school.curriculum_type)}</Badge>
                    </div>
                  </div>
                  
                  {school.registration_number && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Registration Number</p>
                        <p className="text-sm text-gray-600">{school.registration_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(school.year_established || school.principal_name || school.website_url) && (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailsModal;
