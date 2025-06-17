
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Shield, 
  CreditCard, 
  Headphones, 
  Activity,
  Database,
  Globe
} from 'lucide-react';

interface AdministrativeHubProps {
  onModalOpen: (modalType: string) => void;
  onUserCreated?: () => void;
}

const AdministrativeHub = ({ onModalOpen, onUserCreated }: AdministrativeHubProps) => {
  
  const systemActions = [
    {
      id: 'create-user',
      title: 'User Management',
      description: 'Create and manage user accounts across all schools',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      action: () => onModalOpen('createUser')
    },
    {
      id: 'create-school',
      title: 'Schools Management',
      description: 'Add new schools and manage existing institutions',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      action: () => onModalOpen('createSchool')
    },
    {
      id: 'analytics',
      title: 'System Analytics',
      description: 'View comprehensive analytics across all schools',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      action: () => console.log('Navigate to analytics')
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Manage school subscriptions and billing',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      action: () => console.log('Navigate to billing')
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor system performance and uptime',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      action: () => console.log('Navigate to system health')
    },
    {
      id: 'security',
      title: 'Security Center',
      description: 'Manage security settings and audit logs',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      action: () => console.log('Navigate to security')
    },
    {
      id: 'support',
      title: 'Support Center',
      description: 'Manage support tickets and user assistance',
      icon: Headphones,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      action: () => console.log('Navigate to support')
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Manage database operations and backups',
      icon: Database,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      action: () => console.log('Navigate to database')
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure global system settings and preferences',
      icon: Settings,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      action: () => console.log('Navigate to settings')
    }
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">System Management</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Comprehensive admin tools and controls</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.action}
                className={`
                  group cursor-pointer p-4 rounded-xl border border-gray-200 
                  transition-all duration-300 hover:shadow-md hover:scale-105
                  ${action.bgColor} ${action.hoverColor}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
                    <IconComponent className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gray-800 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdministrativeHub;
