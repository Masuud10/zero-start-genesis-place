import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import EduFamAdminAnalytics from './analytics/EduFamAdminAnalytics';
import SchoolAnalyticsList from './analytics/SchoolAnalyticsList';
import CompanyManagementModule from './modules/CompanyManagementModule';
import EduFamReportGeneration from './reports/EduFamReportGeneration';
import ProjectHubModule from './modules/ProjectHubModule';

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const { user } = useAuth();
  
  console.log('🎯 MainContent: Rendering section:', activeSection, 'for user role:', user?.role);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
        
      case 'project-hub':
        if (user?.role === 'edufam_admin') {
          return <ProjectHubModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Insufficient permissions</div>;
        
      case 'analytics':
        if (user?.role === 'edufam_admin') {
          return <EduFamAdminAnalytics />;
        }
        return <AnalyticsDashboard />;
        
      case 'school-analytics':
        if (user?.role === 'edufam_admin') {
          return <SchoolAnalyticsList />;
        }
        return <AnalyticsDashboard />;
        
      case 'company-management':
        if (user?.role === 'edufam_admin') {
          return <CompanyManagementModule />;
        }
        return <div className="p-8 text-center text-red-600">Access Denied: Insufficient permissions</div>;
        
      case 'reports':
        if (user?.role === 'edufam_admin') {
          return <EduFamReportGeneration />;
        }
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          <p className="text-muted-foreground">Report generation feature coming soon for your role.</p>
        </div>;
        
      case 'schools':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Schools Management</h2>
          <p className="text-muted-foreground">Schools management feature coming soon.</p>
        </div>;
        
      case 'users':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-muted-foreground">User management feature coming soon.</p>
        </div>;
        
      case 'billing':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Billing Management</h2>
          <p className="text-muted-foreground">Billing management feature coming soon.</p>
        </div>;
        
      case 'system-health':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <p className="text-muted-foreground">System health monitoring feature coming soon.</p>
        </div>;
        
      case 'announcements':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            {user?.role === 'edufam_admin' ? 'Communication Center' : 'Announcements'}
          </h2>
          <p className="text-muted-foreground">Communication features coming soon.</p>
        </div>;
        
      case 'support':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Support Center</h2>
          <p className="text-muted-foreground">Support center coming soon.</p>
        </div>;
        
      case 'settings':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-muted-foreground">Settings page coming soon.</p>
        </div>;
        
      case 'security':
        return <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <p className="text-muted-foreground">Security management coming soon.</p>
        </div>;
        
      default:
        console.warn('⚠️ MainContent: Unknown section:', activeSection);
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
