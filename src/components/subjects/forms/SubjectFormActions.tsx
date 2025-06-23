
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubjectFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  isFormValid: boolean;
}

const SubjectFormActions: React.FC<SubjectFormActionsProps> = ({
  onCancel,
  onSubmit,
  loading,
  isFormValid
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={loading}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={loading || !isFormValid}
        onClick={onSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Creating...</span>
          </div>
        ) : (
          "Create Subject"
        )}
      </Button>
    </div>
  );
};

export default SubjectFormActions;
