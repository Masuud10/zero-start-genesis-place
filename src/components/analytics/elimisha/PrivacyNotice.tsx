
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const PrivacyNotice: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Data Privacy & Multi-Tenancy Compliance</h4>
            <p className="text-blue-800 text-sm">
              As an Elimisha system administrator, you have access to aggregated analytics and summary data only. 
              Individual student records, personal information, and detailed academic scores remain protected and 
              isolated within each school's data boundaries. All analytics are computed from anonymized, summarized data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyNotice;
