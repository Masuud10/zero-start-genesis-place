
import React from "react";

interface PrincipalWelcomeHeaderProps {
  user: { name?: string };
}

const PrincipalWelcomeHeader: React.FC<PrincipalWelcomeHeaderProps> = ({ user }) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Principal Dashboard</h1>
    <p className="text-gray-600">Welcome back, {user?.name || 'Principal'}!</p>
  </div>
);

export default PrincipalWelcomeHeader;
