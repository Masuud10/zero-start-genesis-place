
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
          width: '420mm',
          height: '297mm',
          maxWidth: '420mm',
          maxHeight: '297mm',
          minWidth: '420mm',
          minHeight: '297mm',
          fontFamily: "'Garamond', 'Times New Roman', serif",
          background: 'linear-gradient(135deg, #fefdfb 0%, #f8f6f0 100%)',
          padding: '20mm',
          boxSizing: 'border-box'
        }}
      >
        {/* Elaborate Border Design */}
        <div 
          className="absolute inset-6 border-8 rounded-lg"
          style={{ 
            borderColor: '#1e3a8a',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderImage: 'linear-gradient(45deg, #1e3a8a, #2563eb, #1e3a8a) 1'
          }}
        >
          {/* Intricate Inner Border with Gold Accent */}
          <div 
            className="absolute inset-4 border-2 rounded-md"
            style={{ 
              borderColor: '#d4af37',
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
          >
            {/* Decorative Corner Elements */}
            <div 
              className="absolute top-2 left-2 w-16 h-16 opacity-30"
              style={{ 
                background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              className="absolute top-2 right-2 w-16 h-16 opacity-30"
              style={{ 
                background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              className="absolute bottom-2 left-2 w-16 h-16 opacity-30"
              style={{ 
                background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              className="absolute bottom-2 right-2 w-16 h-16 opacity-30"
              style={{ 
                background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            ></div>
          </div>
        </div>

        {/* Header Section - School Information */}
        <div className="text-center mb-12 relative z-10" style={{ marginTop: '25mm' }}>
          <div className="mb-8">
            <h1 
              className="text-6xl font-bold mb-6 tracking-wider"
              style={{ 
                fontFamily: "'Cinzel Decorative', 'Garamond', serif",
                color: '#1e3a8a',
                fontSize: '48px',
                lineHeight: '1.1',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '0.1em'
              }}
            >
              {school?.name || 'ACADEMIC INSTITUTION'}
            </h1>
            
            {school?.logo_url && (
              <div 
                className="w-32 h-32 mx-auto mb-6 rounded-full border-4 p-3 bg-white shadow-lg"
                style={{ borderColor: '#d4af37' }}
              >
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {school?.motto && (
              <p 
                className="text-xl italic mb-4"
                style={{ 
                  color: '#6b7280',
                  fontFamily: "'Garamond', serif",
                  fontSize: '20px',
                  fontStyle: 'italic'
                }}
              >
                "{school.motto}"
              </p>
            )}
            
            <div className="text-base" style={{ color: '#6b7280' }}>
              {school?.address && <p className="mb-2">{school.address}</p>}
              <div className="flex justify-center gap-8 text-sm">
                {school?.phone && <span>Tel: {school.phone}</span>}
                {school?.email && <span>Email: {school.email}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-12">
          <h2 
            className="text-5xl font-bold mb-6 tracking-widest"
            style={{ 
              fontFamily: "'Garamond', serif",
              color: '#1e3a8a',
              fontSize: '36px',
              letterSpacing: '0.2em',
              lineHeight: '1.2',
              textTransform: 'uppercase'
            }}
          >
            CERTIFICATE OF ACADEMIC ACHIEVEMENT
          </h2>
        </div>

        {/* Recipient Section */}
        <div className="text-center mb-16">
          <p 
            className="text-xl mb-8"
            style={{ 
              color: '#374151',
              fontFamily: "'Garamond', serif",
              fontSize: '18px'
            }}
          >
            This is to certify that
          </p>
          
          <div className="mb-10">
            <h3 
              className="text-7xl font-bold mb-6 inline-block px-20 pb-6"
              style={{ 
                fontFamily: "'Great Vibes', cursive",
                color: '#1e3a8a',
                fontSize: '60px',
                borderBottom: '4px solid #d4af37',
                fontWeight: 'bold',
                lineHeight: '1.2',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {student.name}
            </h3>
            <p 
              className="text-base mt-4"
              style={{ 
                color: '#6b7280',
                fontFamily: "'Garamond', serif",
                fontSize: '14px'
              }}
            >
              Admission Number: {student.admission_number}
            </p>
          </div>

          {/* Achievement Description */}
          <p 
            className="text-lg mb-10 px-20 leading-relaxed"
            style={{ 
              color: '#374151',
              fontFamily: "'Garamond', serif",
              lineHeight: '1.8',
              fontSize: '16px'
            }}
          >
            has successfully completed the academic requirements and demonstrated outstanding performance 
            during the Academic Year {certificate.academic_year} at {school?.name || 'this institution'}, 
            achieving excellence in their studies with distinction.
          </p>

          {/* Performance Summary */}
          <div 
            className="border-4 rounded-lg p-8 mb-12 mx-24"
            style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderColor: '#d4af37',
              marginBottom: '50px'
            }}
          >
            <div className="grid grid-cols-3 gap-12 text-center">
              <div>
                <p 
                  className="text-4xl font-bold mb-3"
                  style={{ color: '#1e3a8a', fontSize: '32px' }}
                >
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p 
                  className="text-base font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Overall Average
                </p>
              </div>
              <div>
                <p 
                  className="text-4xl font-bold mb-3"
                  style={{ color: '#1e3a8a', fontSize: '32px' }}
                >
                  {studentPerformance.grade_letter || 'A'}
                </p>
                <p 
                  className="text-base font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Grade Achieved
                </p>
              </div>
              <div>
                <p 
                  className="text-4xl font-bold mb-3"
                  style={{ color: '#1e3a8a', fontSize: '32px' }}
                >
                  {attendance.attendance_percentage?.toFixed(1) || '95'}%
                </p>
                <p 
                  className="text-base font-medium"
                  style={{ color: '#6b7280', fontSize: '14px' }}
                >
                  Attendance Rate
                </p>
              </div>
            </div>
          </div>

          {/* Date of Issuance */}
          <p 
            className="text-lg mb-12"
            style={{ 
              color: '#374151',
              fontFamily: "'Garamond', serif",
              fontSize: '16px',
              fontStyle: 'italic'
            }}
          >
            Awarded on this {new Date(certificate.generated_at).getDate()}{getOrdinalSuffix(new Date(certificate.generated_at).getDate())} day of{' '}
            {new Date(certificate.generated_at).toLocaleDateString('en-US', { month: 'long' })},{' '}
            {new Date(certificate.generated_at).getFullYear()}
          </p>
        </div>

        {/* Signature and Seal Section */}
        <div className="absolute bottom-0 left-0 right-0" style={{ bottom: '30mm', height: '60mm' }}>
          <div className="flex justify-between items-start px-20 mb-8">
            {/* Left Signature */}
            <div className="text-center" style={{ width: '200px' }}>
              <div 
                className="w-48 h-px mb-4"
                style={{ backgroundColor: '#374151' }}
              ></div>
              <p 
                className="text-base font-semibold mb-2"
                style={{ color: '#374151', fontSize: '14px' }}
              >
                {school?.principal_name || 'Dr. [Principal Name]'}
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280', fontSize: '12px' }}
              >
                Head of School
              </p>
            </div>
            
            {/* Center - Official Seal */}
            <div className="text-center" style={{ width: '200px' }}>
              <div 
                className="w-24 h-24 mx-auto mb-4 rounded-full border-8 flex items-center justify-center"
                style={{ 
                  borderColor: '#d4af37',
                  background: 'radial-gradient(circle, #d4af37 0%, #b8860b 100%)',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                }}
              >
                <div className="text-white text-center">
                  <p className="text-xs font-bold">OFFICIAL</p>
                  <p className="text-xs font-bold">SEAL</p>
                </div>
              </div>
            </div>
            
            {/* Right Signature */}
            <div className="text-center" style={{ width: '200px' }}>
              <div 
                className="w-48 h-px mb-4"
                style={{ backgroundColor: '#374151' }}
              ></div>
              <p 
                className="text-base font-semibold mb-2"
                style={{ color: '#374151', fontSize: '14px' }}
              >
                Academic Registrar
              </p>
              <p 
                className="text-sm"
                style={{ color: '#6b7280', fontSize: '12px' }}
              >
                Academic Affairs
              </p>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="text-center mt-8">
            <p 
              className="text-sm"
              style={{ 
                color: '#9ca3af',
                fontFamily: "'Garamond', serif",
                fontSize: '11px',
                fontStyle: 'italic'
              }}
            >
              Certificate Serial Number: {serialNumber} | Powered by EduFam Academic Management System
            </p>
          </div>
        </div>

        {/* Decorative Guilloche Pattern Elements */}
        <div 
          className="absolute top-12 left-12 w-20 h-20 opacity-15"
          style={{ 
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                        radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: '10px 10px, 15px 15px'
          }}
        ></div>
        <div 
          className="absolute top-12 right-12 w-20 h-20 opacity-15"
          style={{ 
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                        radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: '10px 10px, 15px 15px'
          }}
        ></div>
        <div 
          className="absolute bottom-12 left-12 w-20 h-20 opacity-15"
          style={{ 
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                        radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: '10px 10px, 15px 15px'
          }}
        ></div>
        <div 
          className="absolute bottom-12 right-12 w-20 h-20 opacity-15"
          style={{ 
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                        radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: '10px 10px, 15px 15px'
          }}
        ></div>
      </div>
    );
  }
);

// Helper function for ordinal suffixes
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
