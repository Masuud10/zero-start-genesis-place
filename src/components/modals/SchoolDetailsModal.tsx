import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  GraduationCap,
  Hash,
  AlertCircle,
} from "lucide-react";

interface SchoolDetailsModalProps {
  school: any;
  isOpen: boolean;
  onClose: () => void;
}

const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({
  school,
  isOpen,
  onClose,
}) => {
  console.log("🏫 SchoolDetailsModal: Rendering with school:", {
    hasSchool: !!school,
    schoolId: school?.id,
    schoolName: school?.name,
    isOpen,
  });

  if (!school) {
    console.warn("🏫 SchoolDetailsModal: No school data provided");
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn("🏫 SchoolDetailsModal: Empty date string provided");
        return "Unknown date";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("🏫 SchoolDetailsModal: Invalid date string:", dateString);
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("🏫 SchoolDetailsModal: Date formatting error:", error);
      return "Unknown date";
    }
  };

  const formatCurriculumType = (type?: string) => {
    if (!type) return "Standard";

    const curriculumMap: Record<string, string> = {
      cbc: "CBC",
      igcse: "IGCSE",
      cambridge: "Cambridge",
      ib: "International Baccalaureate",
    };

    return curriculumMap[type.toLowerCase()] || type;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";

    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800",
    };

    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const handleClose = () => {
    console.log("🏫 SchoolDetailsModal: Closing modal");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={`${school.name} logo`}
                className="w-12 h-12 rounded-lg object-cover border"
                onError={(e) => {
                  console.warn(
                    "🏫 SchoolDetailsModal: Logo failed to load:",
                    school.logo_url
                  );
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {school.name || "Unnamed School"}
              </h2>
              {school.motto && (
                <p className="text-sm text-blue-600 italic">"{school.motto}"</p>
              )}
              {school.status && (
                <Badge className={`mt-1 ${getStatusColor(school.status)}`}>
                  {school.status.charAt(0).toUpperCase() +
                    school.status.slice(1)}
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
                        <p className="text-sm text-gray-600">
                          {school.address}
                        </p>
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
                      <p className="text-sm text-gray-600">
                        {formatDate(school.created_at)}
                      </p>
                    </div>
                  </div>

                  {school.registration_number && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          Registration Number
                        </p>
                        <p className="text-sm text-gray-600">
                          {school.registration_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {school.school_type && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">School Type</p>
                        <Badge variant="outline">
                          {school.school_type.charAt(0).toUpperCase() +
                            school.school_type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(school.year_established ||
            school.principal_name ||
            school.website_url ||
            school.max_students ||
            school.subscription_plan) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {school.year_established && (
                    <div>
                      <p className="text-sm font-medium">Year Established</p>
                      <p className="text-sm text-gray-600">
                        {school.year_established}
                      </p>
                    </div>
                  )}

                  {school.principal_name && (
                    <div>
                      <p className="text-sm font-medium">Principal</p>
                      <p className="text-sm text-gray-600">
                        {school.principal_name}
                      </p>
                    </div>
                  )}

                  {school.principal_contact && (
                    <div>
                      <p className="text-sm font-medium">Principal Contact</p>
                      <p className="text-sm text-gray-600">
                        {school.principal_contact}
                      </p>
                    </div>
                  )}

                  {school.principal_email && (
                    <div>
                      <p className="text-sm font-medium">Principal Email</p>
                      <p className="text-sm text-gray-600">
                        {school.principal_email}
                      </p>
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
                        onClick={(e) => {
                          console.log(
                            "🏫 SchoolDetailsModal: Website link clicked:",
                            school.website_url
                          );
                        }}
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
                      <p className="text-sm text-gray-600">
                        {school.max_students.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {school.subscription_plan && (
                    <div>
                      <p className="text-sm font-medium">Subscription Plan</p>
                      <Badge variant="outline">
                        {school.subscription_plan.charAt(0).toUpperCase() +
                          school.subscription_plan.slice(1)}
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
                      <p className="text-sm text-gray-600">
                        {school.term_structure}
                      </p>
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
                <p className="text-sm text-gray-600">
                  {school.owner_information}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Debug Information - Only show in development */}
          {process.env.NODE_ENV === "development" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <h3 className="font-semibold">Debug Information</h3>
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <p>
                    <strong>School ID:</strong> {school.id}
                  </p>
                  <p>
                    <strong>Created:</strong> {school.created_at}
                  </p>
                  <p>
                    <strong>Updated:</strong> {school.updated_at}
                  </p>
                  <p>
                    <strong>Owner ID:</strong> {school.owner_id || "None"}
                  </p>
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
