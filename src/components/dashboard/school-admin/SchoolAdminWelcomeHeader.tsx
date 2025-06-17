
import React from 'react';
import { AuthUser } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface SchoolAdminWelcomeHeaderProps {
  user?: AuthUser;
}

const SchoolAdminWelcomeHeader: React.FC<SchoolAdminWelcomeHeaderProps> = ({ user }) => {
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {getGreeting()}, {user?.name || 'Admin'}
        </h1>
        <p className="text-muted-foreground">
          Welcome to your school administration dashboard
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {currentTime}
        </Badge>
        <Badge variant="secondary">
          {user?.role === 'principal' ? 'Principal' : 'School Owner'}
        </Badge>
      </div>
    </div>
  );
};

export default SchoolAdminWelcomeHeader;
