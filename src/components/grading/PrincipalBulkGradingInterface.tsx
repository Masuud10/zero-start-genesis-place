
import React, { useState } from 'react';
import { EnhancedBulkGradingModal } from './EnhancedBulkGradingModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { FileSpreadsheet } from 'lucide-react';

const PrincipalBulkGradingInterface: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

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
      
      <Button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Open Grade Entry Sheet
      </Button>

      <EnhancedBulkGradingModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default PrincipalBulkGradingInterface;
