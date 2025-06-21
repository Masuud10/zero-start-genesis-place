
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, MapPin, Calendar, Phone, Mail, Globe, User, GraduationCap, Hash, FileText, Search, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SchoolService, SchoolData } from '@/services/schoolService';
import EnhancedSchoolRegistrationDialog from './schools/EnhancedSchoolRegistrationDialog';
import { Input } from '@/components/ui/input';

const SchoolsModule: React.FC = () => {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSchools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏫 SchoolsModule: Loading schools...');
      const result = await SchoolService.getAllSchools();
      
      if (result.error) {
        console.error('🏫 SchoolsModule: Error from service:', result.error);
        throw new Error(result.error.message || 'Failed to load schools');
      }
      
      const schoolsData = result.data || [];
      console.log('🏫 SchoolsModule: Loaded schools:', schoolsData.length);
      setSchools(schoolsData);
      
    } catch (error: any) {
      console.error('🏫 SchoolsModule: Error loading schools:', error);
      const errorMessage = error?.message || 'Failed to fetch school data';
      setError(errorMessage);
      
      toast({
        title: "Error Loading Schools",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleCreateSuccess = () => {
    loadSchools();
  };

  const formatTermStructure = (structure?: string) => {
    switch (structure) {
      case '3-term':
        return '3-Term System';
      case '2-semester':
        return '2-Semester System';
      default:
        return structure || 'Not specified';
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

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSchools} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Schools Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Register and manage educational institutions in the EduFam network
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New School
        </Button>
      </div>

      {/* Search and Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search schools by name or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Schools</p>
                  <p className="text-2xl font-bold">{schools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">CBC Schools</p>
                  <p className="text-2xl font-bold">
                    {schools.filter(s => s.curriculum_type === 'cbc').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">IGCSE Schools</p>
                  <p className="text-2xl font-bold">
                    {schools.filter(s => s.curriculum_type === 'igcse').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {school.logo_url ? (
                    <img 
                      src={school.logo_url} 
                      alt={`${school.name} logo`}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Building2 className="h-7 w-7 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 text-gray-900">{school.name}</CardTitle>
                    {school.motto && (
                      <p className="text-sm text-blue-600 italic line-clamp-1 mt-1">"{school.motto}"</p>
                    )}
                    {school.slogan && (
                      <p className="text-xs text-gray-500 line-clamp-1">{school.slogan}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {school.curriculum_type && (
                    <Badge variant="outline" className="text-xs">
                      {formatCurriculumType(school.curriculum_type)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-2">{school.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{school.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{school.phone}</span>
                </div>

                {school.website_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <a 
                      href={school.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Registration & Academic Info */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {school.registration_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">Reg: {school.registration_number}</span>
                  </div>
                )}

                {school.year_established && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Est. {school.year_established}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{formatTermStructure(school.term_structure)}</span>
                </div>
              </div>

              {/* Owner Information */}
              {school.owner_information && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Owner</p>
                      <p className="text-gray-700 text-sm line-clamp-2">{school.owner_information}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with creation date */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Registered: {new Date(school.created_at).toLocaleDateString()}</span>
                  {schools.indexOf(school) < 3 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">New</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty states */}
      {filteredSchools.length === 0 && searchTerm && (
        <Card className="text-center py-16">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schools Found</h3>
              <p className="text-gray-600 mb-6">
                No schools match your search criteria. Try adjusting your search terms.
              </p>
              <Button 
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {schools.length === 0 && !loading && !error && (
        <Card className="text-center py-16">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schools Registered</h3>
              <p className="text-gray-600 mb-6">
                Start by registering the first school in the EduFam network to begin managing educational institutions.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register First School
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced School Registration Dialog */}
      <EnhancedSchoolRegistrationDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default SchoolsModule;
