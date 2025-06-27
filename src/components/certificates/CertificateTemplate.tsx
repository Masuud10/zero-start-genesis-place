
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

    // Generate unique serial number from certificate ID
    const serialNumber = `EDF-${certificate.id.slice(0, 8).toUpperCase()}`;

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
          background: '#ffffff',
          padding: '20mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Professional Certificate Border */}
        <div 
          className="absolute inset-5 border-4 rounded-lg"
          style={{ 
            borderColor: '#1e40af',
            borderWidth: '3px',
            borderStyle: 'solid'
          }}
        >
          {/* Inner decorative border */}
          <div 
            className="absolute inset-3 border-2 rounded-md"
            style={{ 
              borderColor: '#3b82f6',
              borderWidth: '1px',
              borderStyle: 'solid',
              opacity: 0.3
            }}
          ></div>
        </div>

        {/* Serial Number - Top Right Corner */}
        <div 
          className="absolute top-6 right-8 text-sm font-mono"
          style={{ 
            color: '#374151',
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}
        >
          Serial No: {serialNumber}
        </div>

        {/* Header Section - School Information */}
        <div className="text-center mb-10 relative z-10" style={{ marginTop: '15mm' }}>
          <div className="flex items-center justify-center gap-8 mb-8">
            {school?.logo_url && (
              <div 
                className="w-24 h-24 rounded-full border-3 p-2 bg-white shadow-lg"
                style={{ borderColor: '#1e40af' }}
              >
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
                  color: '#1e40af',
                  fontSize: '42px',
                  lineHeight: '1.2'
                }}
              >
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p 
                  className="text-lg italic mb-3"
                  style={{ 
                    color: '#6b7280',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '18px'
                  }}
                >
                  "{school.motto}"
                </p>
              )}
              <div className="text-sm" style={{ color: '#9ca3af' }}>
                {school?.address && <p className="mb-1">{school.address}</p>}
                <div className="flex justify-center gap-6 text-xs">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-10">
          <h2 
            className="text-5xl font-bold mb-4 tracking-widest"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e40af',
              fontSize: '52px',
              letterSpacing: '0.15em',
              lineHeight: '1.1'
            }}
          >
            CERTIFICATE
          </h2>
          <h3 
            className="text-2xl font-semibold tracking-wide"
            style={{ 
              color: '#374151',
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px'
            }}
          >
            OF ACADEMIC ACHIEVEMENT
          </h3>
        </div>

        {/* Student Name - Highlight Section */}
        <div className="text-center mb-12">
          <p 
            className="text-lg mb-8"
            style={{ 
              color: '#374151',
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '18px'
            }}
          >
            This is to certify that
          </p>
          
          <div className="mb-8">
            <h3 
              className="text-5xl font-bold mb-4 inline-block px-16 pb-4"
              style={{ 
                fontFamily: "'Great Vibes', cursive",
                color: '#1e40af',
                fontSize: '48px',
                borderBottom: '3px solid #1e40af',
                fontWeight: 'normal',
                lineHeight: '1.2'
              }}
            >
              {student.name}
            </h3>
          </div>

          {/* Certification Text */}
          <p 
            className="text-lg mb-8 px-16 leading-relaxed"
            style={{ 
              color: '#374151',
              fontFamily: "'Open Sans', sans-serif",
              lineHeight: '1.8',
              fontSize: '18px'
            }}
          >
            Has successfully completed the requirements of the Academic Year {certificate.academic_year} 
            at {school?.name || 'this institution'} and has demonstrated excellence in their academic pursuits.
          </p>

          {/* Performance Summary */}
          <div 
            className="border-2 rounded-lg p-8 mb-8 mx-20"
            style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1',
              marginBottom: '40px'
            }}
          >
            <div className="grid grid-cols-3 gap-12 text-center">
              <div>
                <p 
                  className="text-3xl font-bold mb-3"
                  style={{ color: '#1e40af', fontSize: '28px' }}
                >
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Overall Average
                </p>
              </div>
              <div>
                <p 
                  className="text-3xl font-bold mb-3"
                  style={{ color: '#1e40af', fontSize: '28px' }}
                >
                  {studentPerformance.grade_letter || 'A'}
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Grade Achieved
                </p>
              </div>
              <div>
                <p 
                  className="text-3xl font-bold mb-3"
                  style={{ color: '#1e40af', fontSize: '28px' }}
                >
                  {attendance.attendance_percentage?.toFixed(1) || '95'}%
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Attendance Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Properly Spaced Footer */}
        <div className="absolute bottom-0 left-0 right-0" style={{ bottom: '25mm', height: '35mm' }}>
          {/* Signatures Section */}
          <div className="flex justify-between items-start px-16 mb-8">
            {/* Left Bottom Corner - Date of Issue */}
            <div className="text-left" style={{ width: '200px' }}>
              <div 
                className="w-48 h-px mb-4"
                style={{ backgroundColor: '#6b7280' }}
              ></div>
              <p 
                className="text-lg font-semibold mb-2"
                style={{ color: '#374151', fontSize: '16px' }}
              >
                {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280', fontSize: '12px' }}
              >
                Date of Issue
              </p>
            </div>
            
            {/* Right Bottom Corner - Principal's Signature */}
            <div className="text-right" style={{ width: '200px' }}>
              <div 
                className="w-48 h-px mb-4 ml-auto"
                style={{ backgroundColor: '#6b7280' }}
              ></div>
              <p 
                className="text-lg font-semibold mb-2"
                style={{ color: '#374151', fontSize: '16px' }}
              >
                {school?.principal_name || 'Principal'}
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280', fontSize: '12px' }}
              >
                Principal's Signature
              </p>
            </div>
          </div>

          {/* Center Bottom - Edufam Footer with proper spacing */}
          <div className="text-center" style={{ marginTop: '20px' }}>
            <p 
              className="text-sm font-medium"
              style={{ 
                color: '#9ca3af',
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '12px'
              }}
            >
              Powered by <span className="font-semibold">Edufam</span>
            </p>
          </div>
        </div>

        {/* Decorative Corner Elements - Subtle and Well-Positioned */}
        <div 
          className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 opacity-25"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 opacity-25"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 opacity-25"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 opacity-25"
          style={{ borderColor: '#3b82f6' }}
        ></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
