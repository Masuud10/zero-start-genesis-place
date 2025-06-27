
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
          padding: '20mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Elegant Border Frame */}
        <div className="absolute inset-4 border-4 border-navy-800 shadow-inner" style={{ borderColor: '#1e3a8a' }}></div>
        <div className="absolute inset-6 border-2 opacity-60" style={{ borderColor: '#3b82f6' }}></div>
        <div className="absolute inset-8 border opacity-40" style={{ borderColor: '#60a5fa' }}></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4" style={{ borderColor: '#1e3a8a' }}></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4" style={{ borderColor: '#1e3a8a' }}></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4" style={{ borderColor: '#1e3a8a' }}></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4" style={{ borderColor: '#1e3a8a' }}></div>

        {/* Header Section - Institution Name and Logo */}
        <div className="text-center mb-6 relative z-10">
          <div className="flex items-center justify-center gap-8 mb-4">
            {school?.logo_url && (
              <div className="w-20 h-20 rounded-full border-3 p-2 bg-white shadow-lg" style={{ borderColor: '#1e3a8a' }}>
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center">
              <h1 
                className="text-2xl font-bold mb-2 tracking-wide"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: '#1e3a8a'
                }}
              >
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p className="text-base italic mb-2" style={{ color: '#475569' }}>
                  "{school.motto}"
                </p>
              )}
              <div className="text-sm" style={{ color: '#6b7280' }}>
                {school?.address && <p className="mb-1">{school.address}</p>}
                <div className="flex justify-center gap-4">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-px" style={{ backgroundColor: '#1e3a8a' }}></div>
            <div className="w-2 h-2 rounded-full mx-3" style={{ backgroundColor: '#1e3a8a' }}></div>
            <div className="w-16 h-px" style={{ backgroundColor: '#1e3a8a' }}></div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-6">
          <h2 
            className="text-4xl font-bold mb-3 tracking-widest"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e3a8a'
            }}
          >
            CERTIFICATE
          </h2>
          <h3 
            className="text-lg font-semibold mb-2 tracking-wide"
            style={{ color: '#475569' }}
          >
            OF ACADEMIC EXCELLENCE
          </h3>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Academic Year {certificate.academic_year}
          </p>
        </div>

        {/* Main Content - Student Information */}
        <div className="text-center mb-6 px-8">
          <p className="text-base mb-4 leading-relaxed" style={{ color: '#374151' }}>
            This is to certify that
          </p>
          
          <div className="mb-6">
            <h3 
              className="text-3xl font-bold mb-2 tracking-wide inline-block px-8 pb-2"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#1e3a8a',
                borderBottom: '2px solid #1e3a8a'
              }}
            >
              {student.name}
            </h3>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              Admission Number: {student.admission_number}
            </p>
          </div>

          <p className="text-base mb-6 leading-relaxed px-4" style={{ color: '#374151' }}>
            has successfully completed the academic requirements and demonstrated excellence 
            in their studies with outstanding performance during the academic year {certificate.academic_year}
          </p>

          {/* Performance Summary Box */}
          <div 
            className="border-2 rounded-lg p-6 mb-6 mx-8"
            style={{ 
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1'
            }}
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xl font-bold" style={{ color: '#1e3a8a' }}>
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Overall Average</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#1e3a8a' }}>
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Grade Achieved</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: '#1e3a8a' }}>
                  {attendance.attendance_percentage?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Signatures and Date */}
        <div className="absolute bottom-16 left-20 right-20">
          <div className="flex justify-between items-end">
            {/* Principal Signature - Bottom Left */}
            <div className="text-left">
              <div className="w-40 h-px mb-6" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-base font-semibold" style={{ color: '#374151' }}>
                {school?.principal_name || 'Principal'}
              </p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Principal</p>
            </div>
            
            {/* Official Seal - Center */}
            <div className="text-center">
              <div 
                className="w-16 h-16 border-4 rounded-full mb-2 mx-auto flex items-center justify-center bg-white shadow-lg"
                style={{ borderColor: '#1e3a8a' }}
              >
                <div 
                  className="w-10 h-10 border-2 rounded-full flex items-center justify-center"
                  style={{ borderColor: '#3b82f6' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#1e3a8a' }}>SEAL</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#6b7280' }}>Official School Seal</p>
            </div>
            
            {/* Date and School Name - Bottom Right */}
            <div className="text-right">
              <div className="w-32 h-px mb-2" style={{ backgroundColor: '#6b7280' }}></div>
              <p className="text-base font-semibold mb-1" style={{ color: '#374151' }}>
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
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-sm font-medium" style={{ color: '#1e3a8a' }}>
            Powered by <span className="font-semibold">EduFam</span>
          </p>
          <p className="text-xs" style={{ color: '#6b7280' }}>www.edufam.co.ke</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-16 left-16 w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute top-16 right-16 w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
        <div className="absolute bottom-32 right-16 w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: '#3b82f6' }}></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
