
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
          padding: '25mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Professional Certificate Border */}
        <div 
          className="absolute inset-6 border-4 rounded-lg shadow-lg"
          style={{ 
            borderColor: '#1e40af',
            borderWidth: '3px',
            borderStyle: 'solid'
          }}
        >
          {/* Inner decorative border */}
          <div 
            className="absolute inset-4 border-2 rounded-md"
            style={{ 
              borderColor: '#3b82f6',
              borderWidth: '1px',
              borderStyle: 'solid',
              opacity: 0.5
            }}
          ></div>
        </div>

        {/* Serial Number - Top Right Corner */}
        <div 
          className="absolute top-8 right-8 text-sm font-mono"
          style={{ 
            color: '#374151',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Serial No: {serialNumber}
        </div>

        {/* Header Section - School Information */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center gap-6 mb-6">
            {school?.logo_url && (
              <div 
                className="w-20 h-20 rounded-full border-3 p-2 bg-white shadow-md"
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
                className="text-3xl font-bold mb-2 tracking-wide"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: '#1e40af',
                  fontSize: '36px'
                }}
              >
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p 
                  className="text-lg italic mb-2"
                  style={{ 
                    color: '#6b7280',
                    fontFamily: "'Playfair Display', serif"
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
        <div className="text-center mb-8">
          <h2 
            className="text-5xl font-bold mb-3 tracking-widest"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#1e40af',
              fontSize: '48px',
              letterSpacing: '0.1em'
            }}
          >
            CERTIFICATE
          </h2>
          <h3 
            className="text-2xl font-semibold tracking-wide"
            style={{ 
              color: '#374151',
              fontFamily: "'Playfair Display', serif",
              fontSize: '24px'
            }}
          >
            OF ACADEMIC ACHIEVEMENT
          </h3>
        </div>

        {/* Student Name - Highlight Section */}
        <div className="text-center mb-8">
          <p 
            className="text-lg mb-6"
            style={{ 
              color: '#374151',
              fontFamily: "'Open Sans', sans-serif"
            }}
          >
            This is to certify that
          </p>
          
          <div className="mb-6">
            <h3 
              className="text-4xl font-bold mb-3 inline-block px-12 pb-3"
              style={{ 
                fontFamily: "'Great Vibes', cursive",
                color: '#1e40af',
                fontSize: '42px',
                borderBottom: '3px solid #1e40af',
                fontWeight: 'normal'
              }}
            >
              {student.name}
            </h3>
          </div>

          {/* Certification Text */}
          <p 
            className="text-lg mb-6 px-12 leading-relaxed"
            style={{ 
              color: '#374151',
              fontFamily: "'Open Sans', sans-serif",
              lineHeight: '1.8'
            }}
          >
            Has successfully completed the requirements of the Academic Year {certificate.academic_year} 
            at {school?.name || 'this institution'} and has demonstrated excellence in their academic pursuits.
          </p>

          {/* Performance Summary */}
          <div 
            className="border-2 rounded-lg p-6 mb-6 mx-16"
            style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderColor: '#cbd5e1'
            }}
          >
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p 
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#1e40af' }}
                >
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280' }}
                >
                  Overall Average
                </p>
              </div>
              <div>
                <p 
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#1e40af' }}
                >
                  {studentPerformance.grade_letter || 'A'}
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280' }}
                >
                  Grade Achieved
                </p>
              </div>
              <div>
                <p 
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#1e40af' }}
                >
                  {attendance.attendance_percentage?.toFixed(1) || '95'}%
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ color: '#6b7280' }}
                >
                  Attendance Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Footer */}
        <div className="absolute bottom-16 left-0 right-0">
          <div className="flex justify-between items-end px-12">
            {/* Left Bottom Corner - Date of Issue */}
            <div className="text-left">
              <div 
                className="w-48 h-px mb-4"
                style={{ backgroundColor: '#6b7280' }}
              ></div>
              <p 
                className="text-lg font-semibold mb-1"
                style={{ color: '#374151' }}
              >
                {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280' }}
              >
                Date of Issue
              </p>
            </div>
            
            {/* Right Bottom Corner - Principal's Signature */}
            <div className="text-right">
              <div 
                className="w-48 h-px mb-4"
                style={{ backgroundColor: '#6b7280' }}
              ></div>
              <p 
                className="text-lg font-semibold mb-1"
                style={{ color: '#374151' }}
              >
                {school?.principal_name || 'Principal'}
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280' }}
              >
                Principal's Signature
              </p>
            </div>
          </div>
        </div>

        {/* Center Bottom - Edufam Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p 
            className="text-sm font-medium"
            style={{ 
              color: '#9ca3af',
              fontFamily: "'Open Sans', sans-serif"
            }}
          >
            Powered by <span className="font-semibold">Edufam</span>
          </p>
        </div>

        {/* Decorative Corner Elements */}
        <div 
          className="absolute top-8 left-8 w-16 h-16 border-l-3 border-t-3 opacity-30"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute top-8 right-8 w-16 h-16 border-r-3 border-t-3 opacity-30"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute bottom-24 left-8 w-16 h-16 border-l-3 border-b-3 opacity-30"
          style={{ borderColor: '#3b82f6' }}
        ></div>
        <div 
          className="absolute bottom-24 right-8 w-16 h-16 border-r-3 border-b-3 opacity-30"
          style={{ borderColor: '#3b82f6' }}
        ></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
