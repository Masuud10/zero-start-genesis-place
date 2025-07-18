import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";

interface NavigationContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSectionChange: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { adminUser } = useAdminAuthContext();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Set default section based on user role
  useEffect(() => {
    if (adminUser?.role) {
      console.log(
        "🧭 NavigationContext: Setting default section for role:",
        adminUser.role
      );

      // Keep dashboard as default for all roles - the Dashboard component will handle routing
      setActiveSection("dashboard");
    }
  }, [adminUser?.role]);

  const onSectionChange = useCallback(
    (section: string) => {
      console.log(
        "🧭 NavigationContext: Section change from",
        activeSection,
        "to",
        section
      );
      setActiveSection(section);
    },
    [activeSection]
  );

  console.log(
    "🧭 NavigationContext: Current active section:",
    activeSection,
    "for role:",
    adminUser?.role
  );

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        onSectionChange,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
