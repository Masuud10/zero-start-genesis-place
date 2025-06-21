
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, MapPin, Calendar, Phone, Mail, Globe, User, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SchoolService } from '@/services/schoolService';
import EnhancedCreateSchoolDialog from './schools/EnhancedCreateSchoolDialog';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  school_type?: string;
  registration_number?: string;
  year_established?: number;
  term_structure?: string;
  owner_information?: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  principal_id?: string;
}

const SchoolsModule: React.FC = () => {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const result = await SchoolService.getAllSchools();
      if (result.error) {
        throw new Error('Failed to load schools');
      }
      setSchools(result.data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast({
        title: "Error",
        description: "Failed to load schools",
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

  const getSchoolTypeColor = (type?: string) => {
    switch (type) {
      case 'primary':
        return 'bg-green-100 text-green-800';
      case 'secondary':
        return 'bg-blue-100 text-blue-800';
      case 'college':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSchoolType = (type?: string) => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
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
            Manage and monitor schools in the EduFam network
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New School
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Primary Schools</p>
                <p className="text-2xl font-bold">
                  {schools.filter(s => s.school_type === 'primary').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Secondary Schools</p>
                <p className="text-2xl font-bold">
                  {schools.filter(s => s.school_type === 'secondary').length}
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
                <p className="text-sm text-gray-600">Colleges</p>
                <p className="text-2xl font-bold">
                  {schools.filter(s => s.school_type === 'college').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {school.logo_url ? (
                    <img 
                      src={school.logo_url} 
                      alt={`${school.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{school.name}</CardTitle>
                    {school.motto && (
                      <p className="text-sm text-gray-600 italic line-clamp-1">"{school.motto}"</p>
                    )}
                  </div>
                </div>
                <Badge className={getSchoolTypeColor(school.school_type)}>
                  {formatSchoolType(school.school_type)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 line-clamp-1">{school.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{school.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{school.phone}</span>
                </div>

                {school.website_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={school.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline line-clamp-1"
                    >
                      {school.website_url}
                    </a>
                  </div>
                )}

                {school.registration_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Reg: {school.registration_number}</span>
                  </div>
                )}

                {school.year_established && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Est. {school.year_established}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Term: {formatTermStructure(school.term_structure)}</span>
                  <span>Created: {new Date(school.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schools.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Found</h3>
            <p className="text-gray-600 mb-4">
              Start by registering the first school in the EduFam network.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First School
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Create School Dialog */}
      <EnhancedCreateSchoolDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default SchoolsModule;
