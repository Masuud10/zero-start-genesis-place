
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

    // Generate unique serial number
    const generateSerialNumber = () => {
      const date = new Date(certificate.generated_at);
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `CERT-${dateStr}-${randomCode}`;
    };

    const serialNumber = generateSerialNumber();
    const verificationUrl = `https://edufam.app/verify?serial=${serialNumber}`;

    return (
      <div className="w-full h-full bg-gray-50 p-4 flex flex-col">
        {/* Main Certificate Container */}
        <div 
          ref={ref}
          className={`bg-white relative flex-1 ${className}`}
          style={{ 
            width: '420mm',
            height: '297mm',
            maxWidth: '420mm',
            maxHeight: '297mm',
            minWidth: '420mm',
            minHeight: '297mm',
            fontFamily: "'Garamond', 'Times New Roman', serif",
            background: 'linear-gradient(135deg, #fefdfb 0%, #f8f6f0 100%)',
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
                borderStyle: 'solid',
                boxShadow: 'inset 0 0 20px rgba(212, 175, 55, 0.3), 0 0 20px rgba(212, 175, 55, 0.2)'
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

          {/* Subtle Watermark */}
          {school?.logo_url && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                opacity: 0.1,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            >
              <img 
                src={school.logo_url} 
                alt="Watermark"
                className="w-96 h-96 object-contain"
              />
            </div>
          )}

          {/* Main Content Container with Flexbox Layout */}
          <div 
            className="relative z-10 h-full flex flex-col justify-between"
            style={{ 
              padding: '40mm 30mm 20mm 30mm'
            }}
          >
            {/* Header Section */}
            <div className="text-center" style={{ marginBottom: '30px' }}>
              {/* Institution Name */}
              <h1 
                className="font-bold tracking-wider"
                style={{ 
                  fontFamily: "'Cinzel Decorative', 'Garamond', serif",
                  color: '#1e3a8a',
                  fontSize: '42px',
                  lineHeight: '1.1',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '0.1em',
                  marginBottom: '25px'
                }}
              >
                {school?.name || 'ACADEMIC INSTITUTION'}
              </h1>
              
              {/* Institution Logo */}
              {school?.logo_url && (
                <div 
                  className="mx-auto rounded-full border-4 p-3 bg-white shadow-lg"
                  style={{ 
                    borderColor: '#d4af37',
                    width: '120px',
                    height: '120px',
                    marginBottom: '25px'
                  }}
                >
                  <img 
                    src={school.logo_url} 
                    alt={`${school.name} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* School Details */}
              {school?.motto && (
                <p 
                  className="italic"
                  style={{ 
                    color: '#6b7280',
                    fontFamily: "'Garamond', serif",
                    fontSize: '18px',
                    fontStyle: 'italic',
                    marginBottom: '20px'
                  }}
                >
                  "{school.motto}"
                </p>
              )}
              
              <div className="text-base" style={{ color: '#6b7280', marginBottom: '30px' }}>
                {school?.address && <p style={{ marginBottom: '8px' }}>{school.address}</p>}
                <div className="flex justify-center gap-8 text-sm">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center" style={{ marginBottom: '30px' }}>
              <h2 
                className="font-bold tracking-widest"
                style={{ 
                  fontFamily: "'Garamond', serif",
                  color: '#1e3a8a',
                  fontSize: '32px',
                  letterSpacing: '0.2em',
                  lineHeight: '1.2',
                  textTransform: 'uppercase'
                }}
              >
                CERTIFICATE OF ACADEMIC ACHIEVEMENT
              </h2>
            </div>

            {/* Recipient Section */}
            <div className="text-center" style={{ marginBottom: '30px' }}>
              <p 
                className="text-lg"
                style={{ 
                  color: '#374151',
                  fontFamily: "'Garamond', serif",
                  fontSize: '16px',
                  marginBottom: '20px'
                }}
              >
                This is to certify that
              </p>
              
              {/* Recipient's Name */}
              <div style={{ marginBottom: '25px' }}>
                <h3 
                  className="font-bold inline-block px-20 pb-6"
                  style={{ 
                    fontFamily: "'Great Vibes', cursive",
                    color: '#1e3a8a',
                    fontSize: '54px',
                    borderBottom: '4px solid #d4af37',
                    fontWeight: 'bold',
                    lineHeight: '1.2',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {student.name}
                </h3>
                <p 
                  className="text-sm mt-4"
                  style={{ 
                    color: '#6b7280',
                    fontFamily: "'Garamond', serif",
                    fontSize: '12px'
                  }}
                >
                  Admission Number: {student.admission_number}
                </p>
              </div>

              {/* Achievement Description */}
              <p 
                className="text-base px-20 leading-relaxed"
                style={{ 
                  color: '#374151',
                  fontFamily: "'Garamond', serif",
                  lineHeight: '1.8',
                  fontSize: '15px',
                  marginBottom: '30px'
                }}
              >
                has successfully completed the academic requirements and demonstrated outstanding performance 
                during the Academic Year {certificate.academic_year} at {school?.name || 'this institution'}, 
                achieving excellence in their studies with distinction.
              </p>

              {/* Performance Summary */}
              <div 
                className="border-4 rounded-lg p-6 mx-24"
                style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderColor: '#d4af37',
                  marginBottom: '30px',
                  boxShadow: 'inset 0 2px 10px rgba(212, 175, 55, 0.2)'
                }}
              >
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <p 
                      className="font-bold"
                      style={{ color: '#1e3a8a', fontSize: '28px', marginBottom: '8px' }}
                    >
                      {studentPerformance.average_score?.toFixed(1) || '0'}%
                    </p>
                    <p 
                      className="font-medium"
                      style={{ color: '#6b7280', fontSize: '12px' }}
                    >
                      Overall Average
                    </p>
                  </div>
                  <div>
                    <p 
                      className="font-bold"
                      style={{ color: '#1e3a8a', fontSize: '28px', marginBottom: '8px' }}
                    >
                      {studentPerformance.grade_letter || 'A'}
                    </p>
                    <p 
                      className="font-medium"
                      style={{ color: '#6b7280', fontSize: '12px' }}
                    >
                      Grade Achieved
                    </p>
                  </div>
                  <div>
                    <p 
                      className="font-bold"
                      style={{ color: '#1e3a8a', fontSize: '28px', marginBottom: '8px' }}
                    >
                      {attendance.attendance_percentage?.toFixed(1) || '95'}%
                    </p>
                    <p 
                      className="font-medium"
                      style={{ color: '#6b7280', fontSize: '12px' }}
                    >
                      Attendance Rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Date of Issuance */}
              <p 
                className="text-base italic"
                style={{ 
                  color: '#374151',
                  fontFamily: "'Garamond', serif",
                  fontSize: '15px',
                  fontStyle: 'italic',
                  marginBottom: '40px'
                }}
              >
                Awarded on this {new Date(certificate.generated_at).getDate()}{getOrdinalSuffix(new Date(certificate.generated_at).getDate())} day of{' '}
                {new Date(certificate.generated_at).toLocaleDateString('en-US', { month: 'long' })},{' '}
                {new Date(certificate.generated_at).getFullYear()}
              </p>
            </div>

            {/* Signature and Seal Section */}
            <div className="flex justify-between items-start px-20" style={{ marginTop: '50px' }}>
              {/* Left Signature */}
              <div className="text-center" style={{ width: '180px' }}>
                <div 
                  className="w-40 h-px mb-4"
                  style={{ backgroundColor: '#374151' }}
                ></div>
                <p 
                  className="font-semibold mb-2"
                  style={{ color: '#374151', fontSize: '13px' }}
                >
                  {school?.principal_name || 'Dr. [Principal Name]'}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#6b7280', fontSize: '11px' }}
                >
                  Head of School
                </p>
              </div>
              
              {/* Center - Official Seal with Embossed Effect */}
              <div className="text-center" style={{ width: '180px' }}>
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-full border-4 flex items-center justify-center"
                  style={{ 
                    borderColor: '#d4af37',
                    background: 'radial-gradient(circle at 30% 30%, #f4d03f 0%, #d4af37 50%, #b8860b 100%)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.2)',
                    transform: 'rotate(-5deg)'
                  }}
                >
                  <div className="text-white text-center">
                    <p className="text-xs font-bold">OFFICIAL</p>
                    <p className="text-xs font-bold">SEAL</p>
                  </div>
                </div>
              </div>
              
              {/* Right Signature */}
              <div className="text-center" style={{ width: '180px' }}>
                <div 
                  className="w-40 h-px mb-4"
                  style={{ backgroundColor: '#374151' }}
                ></div>
                <p 
                  className="font-semibold mb-2"
                  style={{ color: '#374151', fontSize: '13px' }}
                >
                  Academic Registrar
                </p>
                <p 
                  className="text-sm"
                  style={{ color: '#6b7280', fontSize: '11px' }}
                >
                  Academic Affairs
                </p>
              </div>
            </div>

            {/* Serial Number (Bottom Left) */}
            <div 
              className="absolute bottom-4 left-12 text-xs"
              style={{ 
                color: '#4b5563',
                fontFamily: "'Courier New', monospace",
                fontSize: '9pt'
              }}
            >
              Serial: {serialNumber}
            </div>

            {/* QR Code (Bottom Right) */}
            <div 
              className="absolute bottom-4 right-12 w-16 h-16 bg-white border border-gray-300 flex items-center justify-center text-xs"
              style={{ fontSize: '8px', textAlign: 'center' }}
            >
              <div>
                <div className="w-12 h-12 bg-gray-200 mb-1 flex items-center justify-center text-gray-600">
                  QR
                </div>
                <div className="text-gray-500">Verify</div>
              </div>
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

        {/* Footer - Outside the main certificate */}
        <div className="text-center mt-2">
          <p 
            style={{ 
              color: '#9ca3af',
              fontFamily: "'Arial', sans-serif",
              fontSize: '8pt'
            }}
          >
            Powered by Edufam
          </p>
        </div>
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
