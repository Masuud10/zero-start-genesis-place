import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="h-16 border-b border-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <img
          src="/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png"
          alt="Elimisha Logo"
          className="w-8 h-8 object-contain"
        />
        <h1 className="text-xl font-semibold text-foreground">
          Edufam School Management
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
