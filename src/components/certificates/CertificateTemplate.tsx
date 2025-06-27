
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
          width: '297mm', // A4 landscape width
          height: '210mm', // A4 landscape height
          maxWidth: '297mm',
          maxHeight: '210mm',
          minWidth: '297mm',
          minHeight: '210mm',
          fontFamily: "'Open Sans', sans-serif",
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '15mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Decorative Border Frame */}
        <div className="absolute inset-3 border-4 shadow-inner" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute inset-5 border-2 opacity-60" style={{ borderColor: '#3b82f6' }}></div>
        <div className="absolute inset-6 border opacity-40" style={{ borderColor: '#60a5fa' }}></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-3 left-3 w-16 h-16 border-l-4 border-t-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute top-3 right-3 w-16 h-16 border-r-4 border-t-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute bottom-3 left-3 w-16 h-16 border-l-4 border-b-4" style={{ borderColor: '#1e40af' }}></div>
        <div className="absolute bottom-3 right-3 w-16 h-16 border-r-4 border-b-4" style={{ borderColor: '#1e40af' }}></div>

        {/* Header Section - Institution Name and Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center gap-6 mb-4">
            {school?.logo_url && (
              <div className="w-24 h-24 rounded-full border-3 p-2 bg-white shadow-lg" style={{ borderColor: '#1e40af' }}>
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center">
              <h1 
                className="text-3xl font-bold mb-2 tracking-wide"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: '#1e40af'
                }}
              >
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p className="text-lg italic mb-2" style={{ color: '#475569' }}>
                  "{school.motto}"
                </p>
              )}
              <div className="text-sm" style={{ color: '#6b7280' }}>
                {school?.address && <p className="mb-1">{school.address}</p>}
                <div className="flex justify-center gap-6">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-px" style={{ backgroundColor: '#1e40af' }}></div>
            <div className="w-3 h-3 rounded-full mx-4" style={{ backgroundColor: '#1e40af' }}></div>
            <div className="w-20 h-px" style={{ backgroundColor: '#1e40af' }}></div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 
            className="text-5xl font-bold mb-4 tracking-widest"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e40af'
            }}
          >
            CERTIFICATE
          </h2>
          <h3 
            className="text-2xl font-semibold mb-3 tracking-wide"
            style={{ color: '#475569' }}
          >
            OF ACADEMIC EXCELLENCE
          </h3>
          <p className="text-lg" style={{ color: '#6b7280' }}>
            Academic Year {certificate.academic_year}
          </p>
        </div>

        {/* Main Content - Student Information */}
        <div className="text-center mb-8 px-12">
          <p className="text-lg mb-6 leading-relaxed" style={{ color: '#374151' }}>
            This is to certify that
          </p>
          
          <div className="mb-8">
            <h3 
              className="text-4xl font-bold mb-3 tracking-wide inline-block px-12 pb-3"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#1e40af',
                borderBottom: '3px solid #1e40af'
              }}
            >
              {student.name}
            </h3>
            <p className="text-base mt-3" style={{ color: '#6b7280' }}>
              Admission Number: {student.admission_number}
            </p>
          </div>

          <p className="text-lg mb-8 leading-relaxed px-8" style={{ color: '#374151' }}>
            has successfully completed the academic requirements and demonstrated outstanding excellence 
            in their studies during the academic year {certificate.academic_year}
          </p>

          {/* Performance Summary Box */}
          <div 
            className="border-2 rounded-xl p-8 mb-8 mx-12"
            style={{ 
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1'
            }}
          >
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#1e40af' }}>
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Overall Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#1e40af' }}>
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Grade Achieved</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-2" style={{ color: '#1e40af' }}>
                  {attendance.attendance_percentage?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Signatures and Date */}
        <div className="absolute bottom-20 left-20 right-20">
          <div className="flex justify-between items-end">
            {/* Principal Signature - Bottom Left */}
            <div className="text-left">
              <div className="w-48 h-px mb-4" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-lg font-semibold mb-1" style={{ color: '#374151' }}>
                {school?.principal_name || 'Principal'}
              </p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Principal's Signature</p>
            </div>
            
            {/* Official Seal - Center */}
            <div className="text-center">
              <div 
                className="w-20 h-20 border-4 rounded-full mb-3 mx-auto flex items-center justify-center bg-white shadow-lg"
                style={{ borderColor: '#1e40af' }}
              >
                <div 
                  className="w-12 h-12 border-2 rounded-full flex items-center justify-center"
                  style={{ borderColor: '#3b82f6' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#1e40af' }}>SEAL</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#6b7280' }}>Official School Seal</p>
            </div>
            
            {/* Date - Bottom Right */}
            <div className="text-right">
              <div className="w-40 h-px mb-4" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-lg font-semibold mb-1" style={{ color: '#374151' }}>
                {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Date of Issue</p>
            </div>
          </div>
        </div>

        {/* Powered by EduFam Footer - Center Bottom */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm font-medium italic" style={{ color: '#1e40af' }}>
            Powered by <span className="font-semibold">EduFam</span>
          </p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>www.edufam.co.ke</p>
        </div>

        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
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

        {/* Decorative Corner Accents */}
        <div className="absolute top-12 left-12 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute top-12 right-12 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-32 left-12 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-32 right-12 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
