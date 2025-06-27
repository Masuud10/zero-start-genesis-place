
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
        className={`bg-white p-12 max-w-4xl mx-auto relative ${className}`}
        style={{ 
          minHeight: '800px', 
          maxHeight: '800px',
          fontFamily: 'serif',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
        }}
      >
        {/* Elegant Border Frame */}
        <div className="absolute inset-6 border-4 border-blue-800 shadow-inner"></div>
        <div className="absolute inset-8 border-2 border-blue-600 opacity-60"></div>
        <div className="absolute inset-10 border border-blue-400 opacity-40"></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-blue-800"></div>
        <div className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-blue-800"></div>
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-blue-800"></div>
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-blue-800"></div>

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center gap-6 mb-6">
            {school?.logo_url && (
              <div className="w-24 h-24 rounded-full border-4 border-blue-800 p-2 bg-white shadow-lg">
                <img 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-900 mb-2 tracking-wide">
                {school?.name || 'SCHOOL NAME'}
              </h1>
              {school?.motto && (
                <p className="text-lg italic text-blue-700 mb-2">"{school.motto}"</p>
              )}
              <div className="text-sm text-gray-600">
                {school?.address && <p className="mb-1">{school.address}</p>}
                <div className="flex justify-center gap-4">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-px bg-blue-800"></div>
            <div className="w-3 h-3 bg-blue-800 rounded-full mx-4"></div>
            <div className="w-20 h-px bg-blue-800"></div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-blue-900 mb-4 tracking-widest" style={{ fontFamily: 'serif' }}>
            CERTIFICATE
          </h2>
          <h3 className="text-xl font-semibold text-blue-800 mb-2 tracking-wide">
            OF ACADEMIC EXCELLENCE
          </h3>
          <p className="text-base text-gray-700">Academic Year {certificate.academic_year}</p>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8 px-8">
          <p className="text-lg text-gray-800 mb-6 leading-relaxed">
            This is to certify that
          </p>
          
          <div className="mb-8">
            <h3 className="text-4xl font-bold text-blue-900 mb-2 tracking-wide border-b-2 border-blue-800 pb-2 inline-block px-8">
              {student.name}
            </h3>
            <p className="text-sm text-gray-600 mt-2">Admission Number: {student.admission_number}</p>
          </div>

          <p className="text-lg text-gray-800 mb-8 leading-relaxed">
            has successfully completed the academic requirements and demonstrated excellence 
            in their studies with outstanding performance during the academic year {certificate.academic_year}
          </p>

          {/* Performance Summary Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-8 mx-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-800">
                  {studentPerformance.average_score?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-gray-600">Overall Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800">
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Grade Achieved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800">
                  {attendance.attendance_percentage?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-800 mb-8">
            In recognition of this achievement, this certificate is awarded on this day
          </p>
        </div>

        {/* Footer Section */}
        <div className="absolute bottom-20 left-12 right-12">
          <div className="flex justify-between items-end">
            <div className="text-center">
              <p className="text-base font-semibold text-gray-800 mb-2">
                {new Date(certificate.generated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="w-32 h-px bg-gray-600 mb-2"></div>
              <p className="text-sm text-gray-600">Date of Issue</p>
            </div>
            
            <div className="text-center">
              {/* Official Seal Placeholder */}
              <div className="w-20 h-20 border-4 border-blue-800 rounded-full mb-2 mx-auto flex items-center justify-center bg-blue-50">
                <div className="w-12 h-12 border-2 border-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-800">SEAL</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Official School Seal</p>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-px bg-gray-600 mb-6"></div>
              <p className="text-base font-semibold text-gray-800">
                {school?.principal_name || 'Principal'}
              </p>
              <p className="text-sm text-gray-600">Principal</p>
            </div>
          </div>
        </div>

        {/* Powered by EduFam Footer */}
        <div className="absolute bottom-6 right-12 text-right">
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold text-blue-600">EduFam</span>
          </p>
          <p className="text-xs text-gray-400">www.edufam.co.ke</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-600 rounded-full opacity-60"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-blue-600 rounded-full opacity-60"></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-600 rounded-full opacity-60"></div>
        <div className="absolute bottom-40 right-20 w-2 h-2 bg-blue-600 rounded-full opacity-60"></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
