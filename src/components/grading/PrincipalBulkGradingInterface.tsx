
import React from 'react';
import EnhancedBulkGradingModal from './EnhancedBulkGradingModal';
import { useAuth } from '@/contexts/AuthContext';

const PrincipalBulkGradingInterface: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'principal') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access restricted to principals only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Principal Grade Entry</h3>
        <p className="text-sm text-blue-700">
          As a principal, you can enter grades for any class and subject. 
          Grades entered here will be automatically approved and can be released to students and parents.
        </p>
      </div>
      
      <EnhancedBulkGradingModal userRole="principal" />
    </div>
  );
};

export default PrincipalBulkGradingInterface;
