
import React, { forwardRef } from 'react';
import { Certificate } from '@/types/certificate';
import { School } from '@/types/school';

interface CertificateTemplateProps {
  certificate: Certificate;
  school: School;
  className?: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, school, className = '' }, ref) => {
    const { performance } = certificate;
    const student = performance.student;
    const studentPerformance = performance.performance;
    const attendance = performance.attendance;

    return (
      <div 
        ref={ref}
        className={`bg-white p-8 max-w-4xl mx-auto border-4 border-blue-600 ${className}`}
        style={{ minHeight: '800px', fontFamily: 'serif' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {school.logo && (
              <img 
                src={school.logo} 
                alt={`${school.name} Logo`}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-1">{school.name}</h1>
              <p className="text-sm text-gray-600">{school.address}</p>
              <p className="text-sm text-gray-600">
                Tel: {school.phone} | Email: {school.email}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-blue-800 mb-2">CERTIFICATE OF ACADEMIC ACHIEVEMENT</h2>
          <p className="text-lg text-gray-700">Academic Year {certificate.academic_year}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student Name:</p>
                <p className="text-lg font-semibold text-blue-900">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admission Number:</p>
                <p className="text-lg font-semibold text-blue-900">{student.admission_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Academic Year:</p>
                <p className="text-lg font-semibold text-blue-900">{certificate.academic_year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class Position:</p>
                <p className="text-lg font-semibold text-blue-900">
                  {studentPerformance.class_position ? `Position ${studentPerformance.class_position}` : 'Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 mb-4">Academic Performance Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-green-700">
                  {studentPerformance.total_marks}/{studentPerformance.possible_marks}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-700">
                  {studentPerformance.average_score?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Grade</p>
                <p className="text-2xl font-bold text-green-700">
                  {studentPerformance.grade_letter || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Subject Performance */}
            {studentPerformance.subjects_performance && studentPerformance.subjects_performance.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-green-800 mb-3">Subject Performance</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {studentPerformance.subjects_performance.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="font-medium">{subject.subject_name}</span>
                      <span className="text-green-700 font-semibold">
                        {subject.score}/{subject.max_score} ({subject.grade})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-orange-800 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total School Days</p>
                <p className="text-xl font-bold text-orange-700">{attendance.total_days || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Days Present</p>
                <p className="text-xl font-bold text-orange-700">{attendance.present_days || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-xl font-bold text-orange-700">
                  {attendance.attendance_percentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t-2 border-blue-600 pt-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600 mb-2">Date of Issue:</p>
              <p className="font-semibold">{new Date(certificate.generated_at).toLocaleDateString()}</p>
            </div>
            
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
              <p className="text-sm font-semibold">Principal's Signature</p>
            </div>
          </div>
          
          {/* Powered by EduFam */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>Powered by <span className="font-semibold text-blue-600">EduFam</span> - School Management System</p>
            <p>www.edufam.co.ke</p>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
