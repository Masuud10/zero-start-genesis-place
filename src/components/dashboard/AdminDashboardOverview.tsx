import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Globe,
  School
} from 'lucide-react';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { Badge } from '@/components/ui/badge';

const AdminDashboardOverview = () => {
  const { adminUser } = useAdminAuthContext();
  const { data: schools, isLoading } = useAdminSchoolsData();

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalSchools = schools?.length || 0;
  const activeSchools = schools?.filter(s => s.status === 'active').length || 0;
  const totalStudents = schools?.reduce((sum, school) => sum + (school.total_students || 0), 0) || 0;
  const totalTeachers = schools?.reduce((sum, school) => sum + (school.total_teachers || 0), 0) || 0;

  const stats = [
    {
      title: 'Active Schools',
      value: activeSchools.toLocaleString(),
      icon: Building2,
      change: '+8 this month',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'Total Students',
      value: totalStudents.toLocaleString(),
      icon: Users,
      change: '+156 this week',
      trend: 'up',
      color: 'green'
    },
    {
      title: 'Total Teachers',
      value: totalTeachers.toLocaleString(),
      icon: School,
      change: '+23 this month',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,780',
      icon: DollarSign,
      change: '+12% vs last month',
      trend: 'up',
      color: 'emerald'
    }
  ];

  const recentActivity = [
    {
      type: 'school',
      title: 'New school onboarded: St. Mary\'s Academy',
      time: '5 minutes ago',
      details: 'Premium Plan',
      icon: Building2,
      color: 'emerald'
    },
    {
      type: 'payment',
      title: 'Payment received: $2,400 from Hillcrest High',
      time: '1 hour ago',
      details: 'Annual subscription',
      icon: DollarSign,
      color: 'blue'
    },
    {
      type: 'alert',
      title: 'Support ticket: Integration issue at Valley School',
      time: '3 hours ago',
      details: 'High priority',
      icon: AlertTriangle,
      color: 'orange'
    }
  ];

  const systemHealth = [
    {
      name: 'Core Services',
      status: 'Online',
      details: 'All systems operational',
      health: 'healthy'
    },
    {
      name: 'Database',
      status: 'Healthy',
      details: 'Performance: 99.9%',
      health: 'healthy'
    },
    {
      name: 'API Gateway',
      status: 'Fast',
      details: 'Response time: 120ms',
      health: 'healthy'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {getGreeting()}, {adminUser?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Welcome to your EduFam admin dashboard. Here's what's happening with your platform today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-xs flex items-center ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-500/10' :
                  stat.color === 'green' ? 'bg-emerald-500/10' :
                  stat.color === 'purple' ? 'bg-purple-500/10' :
                  'bg-emerald-500/10'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-emerald-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-emerald-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Business Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className="text-sm text-muted-foreground">+12%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Platform Uptime</span>
                  <span className="text-sm text-muted-foreground">99.9%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.color === 'emerald' ? 'bg-emerald-500/10' :
                    activity.color === 'blue' ? 'bg-blue-500/10' :
                    'bg-orange-500/10'
                  }`}>
                    <activity.icon className={`w-4 h-4 ${
                      activity.color === 'emerald' ? 'text-emerald-600' :
                      activity.color === 'blue' ? 'text-blue-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time} • {activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Platform Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemHealth.map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                  <div>
                    <p className="font-medium">{system.name}</p>
                    <p className="text-sm text-muted-foreground">{system.details}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-100">
                  {system.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;