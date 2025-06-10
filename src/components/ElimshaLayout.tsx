
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface ElimishaLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const ElimishaLayout: React.FC<ElimishaLayoutProps> = ({ 
  children, 
  activeSection, 
  onSectionChange 
}) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={onSectionChange} 
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png" 
                  alt="Elimisha Logo" 
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-xl font-semibold text-foreground">
                  Elimisha School Management
                </h1>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">System Online</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ElimishaLayout;
