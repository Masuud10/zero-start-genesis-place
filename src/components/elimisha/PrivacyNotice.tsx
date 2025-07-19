
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye } from 'lucide-react';

const PrivacyNotice: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="pt-6">
        <Alert className="border-blue-200 bg-transparent">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="space-y-3">
              <div className="font-medium text-blue-900">Privacy & Data Protection Notice</div>
              
              <div className="grid md:grid-cols-3 gap-4 text-blue-800">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <div className="font-medium">Data Aggregation</div>
                    <div className="text-xs">Individual student data is aggregated and anonymized for privacy protection</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <div className="font-medium">Access Control</div>
                    <div className="text-xs">Only authorized administrators can view system-wide analytics</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <div className="font-medium">Compliance</div>
                    <div className="text-xs">All data handling complies with educational privacy regulations</div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-blue-700 pt-2 border-t border-blue-200">
                <strong>Note:</strong> This analytics dashboard displays aggregated school performance metrics. 
                Individual student information remains confidential and is never exposed in these reports. 
                Data is refreshed periodically to ensure accuracy while maintaining privacy standards.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PrivacyNotice;
