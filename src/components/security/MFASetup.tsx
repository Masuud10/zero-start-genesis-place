
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SecurityUtils } from '@/utils/security';

const MFASetup: React.FC = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup'>('status');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkMFAStatus();
    }
  }, [user]);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('mfa_secrets')
        .select('is_enabled')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMfaEnabled(data?.is_enabled || false);
    } catch (error: any) {
      console.error('Failed to check MFA status:', error);
    }
  };

  const generateMFASecret = async () => {
    try {
      setIsLoading(true);
      
      // Generate a random secret key (32 characters)
      const secret = SecurityUtils.generateSecurePassword(32).replace(/[^A-Z0-9]/g, '');
      setSecretKey(secret);
      
      // Generate QR code URL for authenticator apps
      const appName = 'EduFam';
      const userEmail = user?.email || 'user';
      const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${secret}&issuer=${appName}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
      
      setStep('setup');
    } catch (error: any) {
      console.error('Failed to generate MFA secret:', error);
      toast({
        title: "Error",
        description: "Failed to generate MFA secret",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would verify the TOTP code
      // For demo purposes, we'll accept any 6-digit code
      if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);

      // Save MFA settings to database
      const { error } = await supabase
        .from('mfa_secrets')
        .upsert({
          user_id: user?.id,
          secret_key: secretKey, // In production, this should be encrypted
          backup_codes: codes, // In production, these should be encrypted
          is_enabled: true,
          verified_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({ mfa_enabled: true })
        .eq('id', user?.id);

      setMfaEnabled(true);
      setStep('backup');
      
      toast({
        title: "Success",
        description: "MFA has been enabled successfully"
      });
    } catch (error: any) {
      console.error('Failed to verify MFA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify MFA code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('mfa_secrets')
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      await supabase
        .from('profiles')
        .update({ mfa_enabled: false })
        .eq('id', user?.id);

      setMfaEnabled(false);
      setStep('status');
      
      toast({
        title: "Success",
        description: "MFA has been disabled"
      });
    } catch (error: any) {
      console.error('Failed to disable MFA:', error);
      toast({
        title: "Error",
        description: "Failed to disable MFA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard"
    });
  };

  // Only show MFA setup for roles that require it
  if (!user || !SecurityUtils.requiresMFA(user.role)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
          {mfaEnabled && <Badge className="bg-green-100 text-green-800">Enabled</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'status' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {mfaEnabled 
                ? 'MFA is currently enabled for your account. This provides an extra layer of security.'
                : 'Enable multi-factor authentication to add an extra layer of security to your account.'
              }
            </p>
            {mfaEnabled ? (
              <Button
                variant="outline"
                onClick={disableMFA}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                Disable MFA
              </Button>
            ) : (
              <Button onClick={generateMFASecret} disabled={isLoading}>
                <Smartphone className="h-4 w-4 mr-2" />
                Enable MFA
              </Button>
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Setup Authenticator App</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCodeUrl} alt="MFA QR Code" className="border rounded" />
              
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Or enter this code manually:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{secretKey}</code>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Continue to Verification
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Verify Setup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            
            <Input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />

            <div className="flex gap-2">
              <Button onClick={() => setStep('setup')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={verifyMFA} 
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Backup Codes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Codes'}
              </Button>
              <Button onClick={() => setStep('status')} className="flex-1">
                Finish Setup
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;
