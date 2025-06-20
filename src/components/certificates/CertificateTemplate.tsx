
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
        className={`bg-white p-8 max-w-4xl mx-auto border-4 border-blue-600 relative ${className}`}
        style={{ minHeight: '800px', fontFamily: 'serif' }}
      >
        {/* Decorative Border Pattern */}
        <div className="absolute inset-4 border-2 border-blue-300 pointer-events-none"></div>
        <div className="absolute inset-6 border border-blue-200 pointer-events-none"></div>

        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-6 mb-8 relative z-10">
          <div className="flex items-center justify-center gap-6 mb-4">
            {school?.logo_url && (
              <img 
                src={school.logo_url} 
                alt={`${school.name} Logo`}
                className="w-20 h-20 object-contain"
              />
            )}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-900 mb-2">{school?.name || 'School'}</h1>
              {school?.motto && (
                <p className="text-lg italic text-blue-700 mb-1">"{school.motto}"</p>
              )}
              {school?.slogan && (
                <p className="text-sm text-blue-600">{school.slogan}</p>
              )}
              <div className="text-sm text-gray-600 mt-2">
                {school?.address && <p>{school.address}</p>}
                <div className="flex justify-center gap-4 mt-1">
                  {school?.phone && <span>Tel: {school.phone}</span>}
                  {school?.email && <span>Email: {school.email}</span>}
                </div>
                {school?.website_url && (
                  <p className="text-blue-600">Website: {school.website_url}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h2 className="text-5xl font-bold text-blue-800 mb-2 tracking-wide">
              CERTIFICATE
            </h2>
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              OF ACADEMIC ACHIEVEMENT
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto"></div>
          </div>
          <p className="text-lg text-gray-700 mt-4">Academic Year {certificate.academic_year}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Student Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">Student Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Student Name</p>
                <p className="text-2xl font-bold text-blue-900">{student.name}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Admission Number</p>
                <p className="text-xl font-semibold text-blue-900">{student.admission_number}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Academic Year</p>
                <p className="text-xl font-semibold text-blue-900">{certificate.academic_year}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Class Position</p>
                <p className="text-xl font-semibold text-blue-900">
                  {studentPerformance.class_position ? `${studentPerformance.class_position}` : 'Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-600">
            <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Academic Performance Summary</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Marks</p>
                <p className="text-3xl font-bold text-green-700">
                  {studentPerformance.total_marks || 0}/{studentPerformance.possible_marks || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-green-700">
                  {studentPerformance.average_score?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Overall Grade</p>
                <p className="text-3xl font-bold text-green-700">
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Subject Performance */}
            {studentPerformance.subjects_performance && studentPerformance.subjects_performance.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-green-800 mb-3 text-center">Subject Performance</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {studentPerformance.subjects_performance.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <span className="font-medium text-gray-800">{subject.subject_name}</span>
                      <div className="text-right">
                        <span className="text-green-700 font-semibold">
                          {subject.score}/{subject.max_score}
                        </span>
                        <span className="text-green-600 ml-2 text-xs">
                          ({subject.grade})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-l-4 border-orange-600">
            <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">Attendance Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total School Days</p>
                <p className="text-2xl font-bold text-orange-700">{attendance.total_days || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Days Present</p>
                <p className="text-2xl font-bold text-orange-700">{attendance.present_days || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-orange-700">
                  {attendance.attendance_percentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t-2 border-blue-600 pt-8">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <p className="text-sm text-gray-600 mb-2">Date of Issue:</p>
              <p className="font-semibold text-lg">{new Date(certificate.generated_at).toLocaleDateString()}</p>
            </div>
            
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-64 mb-3"></div>
              <p className="text-sm font-semibold text-gray-700">Principal's Signature</p>
              {school?.principal_name && (
                <p className="text-sm text-gray-600 mt-1">{school.principal_name}</p>
              )}
            </div>
          </div>
          
          {/* Powered by EduFam */}
          <div className="text-right mt-8">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-blue-600">EduFam</span>
            </p>
            <p className="text-xs text-gray-400">www.edufam.co.ke</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 left-8 w-8 h-8 border-4 border-blue-300 rounded-full pointer-events-none"></div>
        <div className="absolute top-8 right-8 w-8 h-8 border-4 border-blue-300 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 border-4 border-blue-300 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 w-8 h-8 border-4 border-blue-300 rounded-full pointer-events-none"></div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
