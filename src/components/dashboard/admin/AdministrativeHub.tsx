
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, School, Users, BarChart3, UserPlus } from 'lucide-react';
import CreateUserDialog from '@/components/modules/users/CreateUserDialog';

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated: () => void;
}

const AdministrativeHub: React.FC<AdministrativeHubProps> = ({ onModalOpen, onUserCreated }) => {
  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          Administrative Hub
        </CardTitle>
        <CardDescription className="text-sm">
          Quick access to essential system management tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-200 transition-all duration-200 group"
            onClick={() => onModalOpen('schools')}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-105 transition-transform duration-200">
              <School className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-xs">Manage Schools</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 border-2 hover:border-emerald-200 transition-all duration-200 group"
            onClick={() => onModalOpen('users')}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-xs">Manage Users</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-200 transition-all duration-200 group"
            onClick={() => onModalOpen('analytics')}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-xs">System Analytics</span>
          </Button>
          
          <CreateUserDialog onUserCreated={onUserCreated}>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-200 transition-all duration-200 group w-full"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-105 transition-transform duration-200">
                <UserPlus className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-xs">Create User</span>
            </Button>
          </CreateUserDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdministrativeHub;
