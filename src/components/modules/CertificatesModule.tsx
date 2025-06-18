
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CertificateGenerator from '@/components/certificates/CertificateGenerator';
import RoleGuard from '@/components/common/RoleGuard';

const CertificatesModule = () => {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['principal', 'edufam_admin']} requireSchoolAssignment>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Certificate Management
          </h1>
          <p className="text-muted-foreground">
            Generate and manage academic certificates for students.
          </p>
        </div>
        
        <CertificateGenerator />
      </div>
    </RoleGuard>
  );
};

export default CertificatesModule;
