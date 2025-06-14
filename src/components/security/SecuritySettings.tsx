
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MFASetup from './MFASetup';
import SessionManager from './SessionManager';
import SecurityAuditLog from './SecurityAuditLog';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Please log in to access security settings</p>
        </CardContent>
      </Card>
    );
  }

  const isAdmin = ['elimisha_admin', 'edufam_admin'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Security Settings</h1>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user.mfa_enabled ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">MFA Status</div>
              <div className="text-xs text-gray-500">
                {user.mfa_enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'elimisha_admin' ? 'HIGH' : 'MEDIUM'}
              </div>
              <div className="text-sm text-gray-600">Access Level</div>
              <div className="text-xs text-gray-500">
                Role: {user.role}
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Login</div>
              <div className="text-xs text-gray-500">
                IP: {user.last_login_ip || 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MFA Setup */}
      <MFASetup />

      {/* Session Management */}
      <SessionManager />

      {/* Security Audit Log - Only for Admins */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Security Monitoring</h2>
          </div>
          <SecurityAuditLog />
        </div>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Use Strong Passwords:</strong> Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Enable MFA:</strong> Add an extra layer of security with multi-factor authentication.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Monitor Sessions:</strong> Regularly review your active sessions and terminate any suspicious ones.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Keep Software Updated:</strong> Always use the latest version of your browser and operating system.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <strong>Be Cautious with Public Wi-Fi:</strong> Avoid accessing sensitive information on unsecured networks.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
