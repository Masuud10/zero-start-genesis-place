
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Header from './Header';
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
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
