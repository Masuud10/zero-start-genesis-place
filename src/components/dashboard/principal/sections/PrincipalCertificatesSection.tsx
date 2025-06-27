
import React from 'react';
import CertificatesList from '@/components/certificates/CertificatesList';

const PrincipalCertificatesSection: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificates & Documents</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <CertificatesList />
      </div>
    </section>
  );
};

export default PrincipalCertificatesSection;
