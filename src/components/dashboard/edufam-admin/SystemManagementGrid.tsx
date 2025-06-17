
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  BarChart3, 
  Shield, 
  Settings, 
  Activity,
  CreditCard,
  Database,
  Headphones,
  TrendingUp,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface SystemManagementGridProps {
  onActionClick: (actionId: string) => void;
}

const SystemManagementGrid: React.FC<SystemManagementGridProps> = ({ onActionClick }) => {
  const systemActions = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Create and manage user accounts across all schools',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      id: 'schools',
      title: 'Schools Management',
      description: 'Add new schools and manage existing institutions',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-700'
    },
    {
      id: 'analytics',
      title: 'System Analytics',
      description: 'View comprehensive analytics across all schools',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Manage school subscriptions and billing',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      textColor: 'text-orange-700'
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Monitor system performance and uptime',
      icon: Activity,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      textColor: 'text-red-700'
    },
    {
      id: 'security',
      title: 'Security Center',
      description: 'Manage security settings and audit logs',
      icon: Shield,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      textColor: 'text-indigo-700'
    },
    {
      id: 'support',
      title: 'Support Center',
      description: 'Manage support tickets and user assistance',
      icon: Headphones,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      textColor: 'text-cyan-700'
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Manage database operations and backups',
      icon: Database,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      textColor: 'text-gray-700'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure global system settings and preferences',
      icon: Settings,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
      textColor: 'text-slate-700'
    }
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              System Management Center
            </CardTitle>
            <p className="text-gray-600">
              Comprehensive administrative tools and system controls
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card
                key={action.id}
                className={`group cursor-pointer border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-gray-200 ${action.bgColor} ${action.hoverColor}`}
                onClick={() => onActionClick(action.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className={`font-bold text-lg ${action.textColor} group-hover:text-gray-900 transition-colors`}>
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`mt-4 ${action.textColor} hover:bg-white/80 transition-all duration-300 group-hover:bg-white group-hover:shadow-md`}
                    >
                      Manage <TrendingUp className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 text-blue-700">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">
              System administrative functions require elevated privileges. All actions are logged for security purposes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemManagementGrid;
