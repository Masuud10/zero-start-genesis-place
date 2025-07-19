import React, { createContext, useContext, useState, ReactNode } from "react";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";

interface NavigationContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useConsolidatedAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["Dashboard"]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  const value: NavigationContextType = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    currentPage,
    setCurrentPage,
    breadcrumbs,
    setBreadcrumbs,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
