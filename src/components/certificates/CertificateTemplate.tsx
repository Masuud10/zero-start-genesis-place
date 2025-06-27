
import React, { forwardRef } from 'react';
import { Certificate } from '@/types/certificate';

interface CertificateTemplateProps {
  certificate: Certificate;
  className?: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, className = '' }, ref) => {
    const { performance } = certificate;
    const student = performance.student;
    const school = performance.school;
    const studentPerformance = performance.performance;
    const attendance = performance.attendance;

    return (
      <div 
        ref={ref}
        className={`bg-white relative ${className}`}
        style={{ 
          width: '297mm',
          height: '210mm',
          maxWidth: '297mm',
          maxHeight: '210mm',
          minWidth: '297mm',
          minHeight: '210mm',
          fontFamily: "'Open Sans', sans-serif",
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '20mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Professional Border Frame */}
        <div className="absolute inset-4 border-4 shadow-lg" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute inset-6 border-2 opacity-60" style={{ borderColor: '#3b82f6' }}></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-20 h-20 border-l-4 border-t-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute top-4 right-4 w-20 h-20 border-r-4 border-t-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute bottom-4 left-4 w-20 h-20 border-l-4 border-b-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 border-r-4 border-b-4" style={{ borderColor: '#1e40af' }}></div>

        {/* Header Section - School Logo and Name */}
        <div className="text-center mb-10 relative z-10">
          <div className="flex items-center justify-center gap-8 mb-6">
            {school?.logo_url && (
              <div className="w-28 h-28 rounded-full border-4 p-3 bg-white shadow-xl" style={{ borderColor: '#1e40af' }}>
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center">
              <h1 
                className="text-4xl font-bold mb-3 tracking-wide"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: '#1e40af'
                }}
              >
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p className="text-xl italic mb-3" style={{ color: '#475569' }}>
                  "{school.motto}"
                </p>
              )}
              <div className="text-base" style={{ color: '#6b7280' }}>
                {school?.address && <p className="mb-2">{school.address}</p>}
                <div className="flex justify-center gap-8">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px" style={{ backgroundColor: '#1e40af' }}></div>
            <div className="w-4 h-4 rounded-full mx-6" style={{ backgroundColor: '#1e40af' }}></div>
            <div className="w-24 h-px" style={{ backgroundColor: '#1e40af' }}></div>
          </div>
        </div>

        {/* Certificate Title Section */}
        <div className="text-center mb-10">
          <h2 
            className="text-6xl font-bold mb-5 tracking-widest"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e40af'
            }}
          >
            CERTIFICATE
          </h2>
          <h3 
            className="text-3xl font-semibold mb-4 tracking-wide"
            style={{ color: '#475569' }}
          >
            OF ACADEMIC ACHIEVEMENT
          </h3>
          <p className="text-xl" style={{ color: '#6b7280' }}>
            Academic Year {certificate.academic_year}
          </p>
        </div>

        {/* Student Information Section */}
        <div className="text-center mb-10 px-16">
          <p className="text-xl mb-8 leading-relaxed" style={{ color: '#374151' }}>
            This is to certify that
          </p>
          
          <div className="mb-10">
            <h3 
              className="text-5xl font-bold mb-4 tracking-wide inline-block px-16 pb-4"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#1e40af',
                borderBottom: '4px solid #1e40af'
              }}
            >
              {student.name}
            </h3>
            <p className="text-lg mt-4" style={{ color: '#6b7280' }}>
              Admission Number: {student.admission_number}
            </p>
          </div>

          <p className="text-xl mb-10 leading-relaxed px-12" style={{ color: '#374151' }}>
            has successfully completed the academic requirements and demonstrated 
            outstanding excellence in their studies during the academic year {certificate.academic_year}
          </p>

          {/* Performance Summary Card */}
          <div 
            className="border-3 rounded-xl p-10 mb-8 mx-16"
            style={{ 
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1'
            }}
          >
            <div className="grid grid-cols-3 gap-12 text-center">
              <div>
                <p className="text-3xl font-bold mb-3" style={{ color: '#1e40af' }}>
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p className="text-base font-medium" style={{ color: '#6b7280' }}>Overall Average</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-3" style={{ color: '#1e40af' }}>
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
                <p className="text-base font-medium" style={{ color: '#6b7280' }}>Grade Achieved</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-3" style={{ color: '#1e40af' }}>
                  {attendance.attendance_percentage?.toFixed(1) || '0'}%
                </p>
                <p className="text-base font-medium" style={{ color: '#6b7280' }}>Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section - Bottom Area */}
        <div className="absolute bottom-24 left-24 right-24">
          <div className="flex justify-between items-end">
            {/* Principal Signature */}
            <div className="text-left">
              <div className="w-56 h-px mb-5" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>
                {school?.principal_name || 'Principal'}
              </p>
              <p className="text-base" style={{ color: '#6b7280' }}>Principal's Signature</p>
            </div>
            
            {/* Official School Seal */}
            <div className="text-center">
              <div 
                className="w-24 h-24 border-4 rounded-full mb-4 mx-auto flex items-center justify-center bg-white shadow-xl"
                style={{ borderColor: '#1e40af' }}
              >
                <div 
                  className="w-16 h-16 border-3 rounded-full flex items-center justify-center"
                  style={{ borderColor: '#3b82f6' }}
                >
                  <span className="text-sm font-bold" style={{ color: '#1e40af' }}>SEAL</span>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: '#6b7280' }}>Official School Seal</p>
            </div>
            
            {/* Date Section */}
            <div className="text-right">
              <div className="w-48 h-px mb-5" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-xl font-semibold mb-2" style={{ color: '#374151' }}>
                {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-base" style={{ color: '#6b7280' }}>Date of Issue</p>
            </div>
          </div>
        </div>

        {/* Certificate ID */}
        <div className="absolute bottom-16 right-24">
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Certificate ID: {certificate.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* EduFam Footer */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-base font-medium italic" style={{ color: '#1e40af' }}>
            Powered by <span className="font-semibold">EduFam</span>
          </p>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>www.edufam.co.ke</p>
        </div>

        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
          <div 
            className="text-9xl font-bold"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e40af',
              transform: 'rotate(-45deg)'
            }}
          >
            EDUFAM
          </div>
        </div>

        {/* Decorative Accent Dots */}
        <div className="absolute top-16 left-16 w-3 h-3 rounded-full opacity-70" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute top-16 right-16 w-3 h-3 rounded-full opacity-70" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-36 left-16 w-3 h-3 rounded-full opacity-70" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-36 right-16 w-3 h-3 rounded-full opacity-70" style={{ backgroundColor: '#3b82f6' }}></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
