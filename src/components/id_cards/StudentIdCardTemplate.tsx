import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface StudentIdCardTemplateProps {
  student?: {
    id: string;
    name: string;
    admission_number: string;
    class_name: string;
    date_of_birth: string;
    photo_url?: string;
  };
  school?: {
    name: string;
    logo_url?: string;
  };
  issueDate?: string;
  expiryDate?: string;
}

const StudentIdCardTemplate: React.FC<StudentIdCardTemplateProps> = ({
  student,
  school,
  issueDate,
  expiryDate,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate QR code data
  const qrCodeData = student ? `STUDENT_ID:${student.admission_number}|NAME:${student.name}|CLASS:${student.class_name}` : '';

  return (
    <div className="id-card-container" style={{ 
      width: '324px', 
      height: '204px', 
      border: '2px solid #2563eb',
      borderRadius: '8px',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '40px',
        borderBottom: '1px solid #1d4ed8'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {school?.logo_url && (
            <img 
              src={school.logo_url} 
              alt="School Logo"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '2px',
                backgroundColor: 'white',
                padding: '2px'
              }}
            />
          )}
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            {school?.name || 'School Name'}
          </div>
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: '500'
        }}>
          STUDENT ID
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: 'flex',
        padding: '12px',
        height: 'calc(100% - 80px)', // Account for header and footer
        gap: '12px'
      }}>
        {/* Left Side - Photo */}
        <div style={{
          width: '60px',
          height: '75px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {student?.photo_url ? (
            <img 
              src={student.photo_url} 
              alt="Student Photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              color: '#9ca3af',
              fontSize: '8px',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              STUDENT<br />PHOTO
            </div>
          )}
        </div>

        {/* Right Side - Details */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '500' }}>NAME</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#111827' }}>
                {student?.name || 'Student Name'}
              </div>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '500' }}>STUDENT ID</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#2563eb' }}>
                {student?.admission_number || 'STU-0000'}
              </div>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '500' }}>CLASS</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#111827' }}>
                {student?.class_name || 'Class Name'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '500' }}>DATE OF BIRTH</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#111827' }}>
                {student?.date_of_birth ? formatDate(student.date_of_birth) : 'DD MMM YYYY'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px'
      }}>
        {/* Left Side - QR Code */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {qrCodeData && (
              <QRCodeSVG 
                value={qrCodeData}
                size={24}
                level="M"
              />
            )}
          </div>
          <div style={{ fontSize: '7px', color: '#6b7280' }}>
            VERIFY
          </div>
        </div>

        {/* Right Side - Dates */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '7px', color: '#6b7280' }}>
            ISSUED: {issueDate ? formatDate(issueDate) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '7px', color: '#6b7280' }}>
            EXPIRES: {expiryDate ? formatDate(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentIdCardTemplate;