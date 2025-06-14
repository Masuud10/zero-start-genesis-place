
import React from 'react';
import { SecurityUtils } from '@/utils/security';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className = ''
}) => {
  const validation = SecurityUtils.validatePasswordStrength(password);
  
  if (!password) return null;

  const getStrengthColor = () => {
    if (validation.isValid) return 'text-green-600';
    if (validation.errors.length <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrengthText = () => {
    if (validation.isValid) return 'Strong';
    if (validation.errors.length <= 2) return 'Medium';
    return 'Weak';
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className={`text-sm font-medium ${getStrengthColor()}`}>
        Password Strength: {getStrengthText()}
      </div>
      {validation.errors.length > 0 && (
        <ul className="mt-1 text-xs text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
