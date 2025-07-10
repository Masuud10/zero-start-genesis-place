import React, { forwardRef } from "react";
import { Certificate } from "@/types/certificate";
import QRCodeComponent from "@/components/ui/QRCode";

interface CertificateTemplateProps {
  certificate: Certificate;
  className?: string;
}

const CertificateTemplate = forwardRef<
  HTMLDivElement,
  CertificateTemplateProps
>(({ certificate, className = "" }, ref) => {
  const { performance } = certificate;
  const student = performance.student;
  const school = performance.school;
  const studentPerformance = performance.performance;
  const attendance = performance.attendance;

  // Generate unique certificate ID
  const generateCertificateId = () => {
    const date = new Date(certificate.generated_at);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${dateStr}-${randomCode}`;
  };

  const certificateId = generateCertificateId();
  const verificationUrl = `https://edufam.org/verify-certificate/${certificateId}`;

  return (
    <div className="w-full h-full bg-gray-50 p-4 flex flex-col">
      {/* Main Certificate Container */}
      <div
        ref={ref}
        className={`bg-white relative flex-1 ${className}`}
        style={{
          width: "420mm",
          height: "297mm",
          maxWidth: "420mm",
          maxHeight: "297mm",
          minWidth: "420mm",
          minHeight: "297mm",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          background: "linear-gradient(135deg, #fefdfb 0%, #f8f6f0 100%)",
          boxSizing: "border-box",
        }}
      >
        {/* Prestigious Border Design */}
        <div
          className="absolute inset-8 border-8 rounded-lg"
          style={{
            borderColor: "#1e3a8a",
            borderWidth: "8px",
            borderStyle: "solid",
            borderImage: "linear-gradient(45deg, #1e3a8a, #2563eb, #1e3a8a) 1",
          }}
        >
          {/* Gold Inner Border */}
          <div
            className="absolute inset-4 border-2 rounded-md"
            style={{
              borderColor: "#d4af37",
              borderWidth: "3px",
              borderStyle: "solid",
              boxShadow:
                "inset 0 0 20px rgba(212, 175, 55, 0.3), 0 0 20px rgba(212, 175, 55, 0.2)",
            }}
          >
            {/* Decorative Corner Elements */}
            <div
              className="absolute top-3 left-3 w-12 h-12 opacity-40"
              style={{
                background:
                  "radial-gradient(circle, #d4af37 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            ></div>
            <div
              className="absolute top-3 right-3 w-12 h-12 opacity-40"
              style={{
                background:
                  "radial-gradient(circle, #d4af37 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            ></div>
            <div
              className="absolute bottom-3 left-3 w-12 h-12 opacity-40"
              style={{
                background:
                  "radial-gradient(circle, #d4af37 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            ></div>
            <div
              className="absolute bottom-3 right-3 w-12 h-12 opacity-40"
              style={{
                background:
                  "radial-gradient(circle, #d4af37 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            ></div>
          </div>
        </div>

        {/* Subtle Watermark */}
        {school?.logo_url && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0.08,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <img
              src={school.logo_url}
              alt="Watermark"
              className="w-80 h-80 object-contain"
            />
          </div>
        )}

        {/* Main Content Container */}
        <div
          className="relative z-10 h-full flex flex-col justify-between"
          style={{
            padding: "45mm 35mm 25mm 35mm",
          }}
        >
          {/* HEADER SECTION */}
          <div className="text-center" style={{ marginBottom: "35px" }}>
            {/* School Logo - Centered at Top */}
            {school?.logo_url && (
              <div
                className="mx-auto rounded-full border-4 p-4 bg-white shadow-lg mb-6"
                style={{
                  borderColor: "#d4af37",
                  width: "100px",
                  height: "100px",
                }}
              >
                <img
                  src={school.logo_url}
                  alt={`${school.name} Logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* School Name - Bold Uppercase */}
            <h1
              className="font-bold tracking-wider"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: "#1e3a8a",
                fontSize: "38px",
                lineHeight: "1.1",
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                letterSpacing: "0.15em",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              {school?.name || "ACADEMIC INSTITUTION"}
            </h1>

            {/* School Motto */}
            {school?.motto && (
              <p
                className="italic"
                style={{
                  color: "#6b7280",
                  fontFamily: "'Georgia', serif",
                  fontSize: "16px",
                  fontStyle: "italic",
                  marginBottom: "15px",
                }}
              >
                "{school.motto}"
              </p>
            )}

            {/* School Details */}
            <div
              className="text-sm"
              style={{ color: "#6b7280", marginBottom: "25px" }}
            >
              {school?.address && (
                <p style={{ marginBottom: "6px" }}>{school.address}</p>
              )}
              <div className="flex justify-center gap-6 text-xs">
                {school?.phone && <span>Tel: {school.phone}</span>}
                {school?.email && <span>Email: {school.email}</span>}
              </div>
            </div>
          </div>

          {/* CERTIFICATE BODY */}
          <div
            className="text-center flex-1 flex flex-col justify-center"
            style={{ marginBottom: "30px" }}
          >
            {/* Certificate Title */}
            <h2
              className="font-bold tracking-widest mb-8"
              style={{
                fontFamily: "'Georgia', serif",
                color: "#1e3a8a",
                fontSize: "28px",
                letterSpacing: "0.2em",
                lineHeight: "1.2",
                textTransform: "uppercase",
              }}
            >
              Certificate of Academic Achievement
            </h2>

            {/* Statement */}
            <p
              className="text-base mb-6"
              style={{
                color: "#374151",
                fontFamily: "'Georgia', serif",
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              This is to certify that
            </p>

            {/* Student Name - Bold and Larger */}
            <div style={{ marginBottom: "25px" }}>
              <h3
                className="font-bold inline-block px-16 pb-4"
                style={{
                  fontFamily: "'Georgia', serif",
                  color: "#1e3a8a",
                  fontSize: "48px",
                  borderBottom: "4px solid #d4af37",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {student.name}
              </h3>
              <p
                className="text-sm mt-3"
                style={{
                  color: "#6b7280",
                  fontFamily: "'Georgia', serif",
                  fontSize: "12px",
                }}
              >
                Admission Number: {student.admission_number}
              </p>
            </div>

            {/* Achievement Description */}
            <p
              className="text-base px-16 leading-relaxed mb-6"
              style={{
                color: "#374151",
                fontFamily: "'Georgia', serif",
                lineHeight: "1.8",
                fontSize: "15px",
              }}
            >
              has successfully completed the academic requirements for{" "}
              <strong>{certificate.academic_year}</strong> at{" "}
              <strong>{school?.name || "this institution"}</strong>.
            </p>

            {/* Academic Details */}
            <div
              className="border-4 rounded-lg p-6 mx-20 mb-6"
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                borderColor: "#d4af37",
                boxShadow: "inset 0 2px 10px rgba(212, 175, 55, 0.2)",
              }}
            >
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p
                    className="font-bold"
                    style={{
                      color: "#1e3a8a",
                      fontSize: "26px",
                      marginBottom: "6px",
                    }}
                  >
                    {studentPerformance.average_score?.toFixed(1) || "0"}%
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: "#6b7280", fontSize: "11px" }}
                  >
                    Overall Average
                  </p>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{
                      color: "#1e3a8a",
                      fontSize: "26px",
                      marginBottom: "6px",
                    }}
                  >
                    {studentPerformance.grade_letter || "A"}
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: "#6b7280", fontSize: "11px" }}
                  >
                    Grade Achieved
                  </p>
                </div>
                <div>
                  <p
                    className="font-bold"
                    style={{
                      color: "#1e3a8a",
                      fontSize: "26px",
                      marginBottom: "6px",
                    }}
                  >
                    {attendance.attendance_percentage?.toFixed(1) || "95"}%
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: "#6b7280", fontSize: "11px" }}
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
                color: "#374151",
                fontFamily: "'Georgia', serif",
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Awarded on this {new Date(certificate.generated_at).getDate()}
              {getOrdinalSuffix(
                new Date(certificate.generated_at).getDate()
              )}{" "}
              day of{" "}
              {new Date(certificate.generated_at).toLocaleDateString("en-US", {
                month: "long",
              })}
              , {new Date(certificate.generated_at).getFullYear()}
            </p>
          </div>

          {/* FOOTER SECTION */}
          <div
            className="flex justify-between items-start px-16"
            style={{ marginTop: "40px" }}
          >
            {/* Left Signature */}
            <div className="text-center" style={{ width: "160px" }}>
              <div
                className="w-32 h-px mb-3"
                style={{ backgroundColor: "#374151" }}
              ></div>
              <p
                className="font-semibold mb-1"
                style={{ color: "#374151", fontSize: "12px" }}
              >
                {school?.principal_name || "Dr. [Principal Name]"}
              </p>
              <p
                className="text-xs"
                style={{ color: "#6b7280", fontSize: "10px" }}
              >
                Head of School
              </p>
            </div>

            {/* Center - Official Seal */}
            <div className="text-center" style={{ width: "160px" }}>
              <div
                className="w-16 h-16 mx-auto mb-3 rounded-full border-3 flex items-center justify-center"
                style={{
                  borderColor: "#d4af37",
                  background:
                    "radial-gradient(circle at 30% 30%, #f4d03f 0%, #d4af37 50%, #b8860b 100%)",
                  boxShadow:
                    "0 4px 15px rgba(212, 175, 55, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.2)",
                  transform: "rotate(-5deg)",
                }}
              >
                <div className="text-white text-center">
                  <p className="text-xs font-bold">OFFICIAL</p>
                  <p className="text-xs font-bold">SEAL</p>
                </div>
              </div>
            </div>

            {/* Right Signature */}
            <div className="text-center" style={{ width: "160px" }}>
              <div
                className="w-32 h-px mb-3"
                style={{ backgroundColor: "#374151" }}
              ></div>
              <p
                className="font-semibold mb-1"
                style={{ color: "#374151", fontSize: "12px" }}
              >
                Academic Registrar
              </p>
              <p
                className="text-xs"
                style={{ color: "#6b7280", fontSize: "10px" }}
              >
                Academic Affairs
              </p>
            </div>
          </div>

          {/* Certificate ID (Bottom Left) */}
          <div
            className="absolute bottom-6 left-16 text-xs"
            style={{
              color: "#4b5563",
              fontFamily: "'Courier New', monospace",
              fontSize: "9pt",
            }}
          >
            Certificate ID: {certificateId}
          </div>

          {/* QR Code (Bottom Right) */}
          <div
            className="absolute bottom-6 right-16 flex flex-col items-center"
            style={{ fontSize: "8px", textAlign: "center" }}
          >
            <div className="bg-white p-2 border border-gray-300 rounded">
              <QRCodeComponent
                value={verificationUrl}
                size={48}
                errorCorrectionLevel="H"
                color={{
                  dark: "#1e3a8a",
                  light: "#FFFFFF",
                }}
              />
            </div>
            <div className="text-gray-600 mt-1 text-xs">Scan to Verify</div>
          </div>
        </div>

        {/* Decorative Guilloche Pattern Elements */}
        <div
          className="absolute top-16 left-16 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                          radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: "8px 8px, 12px 12px",
          }}
        ></div>
        <div
          className="absolute top-16 right-16 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                          radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: "8px 8px, 12px 12px",
          }}
        ></div>
        <div
          className="absolute bottom-16 left-16 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                          radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: "8px 8px, 12px 12px",
          }}
        ></div>
        <div
          className="absolute bottom-16 right-16 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle, transparent 30%, #1e3a8a 31%, #1e3a8a 32%, transparent 33%), 
                          radial-gradient(circle, transparent 40%, #d4af37 41%, #d4af37 42%, transparent 43%)`,
            backgroundSize: "8px 8px, 12px 12px",
          }}
        ></div>
      </div>

      {/* Footer - Outside the main certificate */}
      <div className="text-center mt-3">
        <p
          style={{
            color: "#9ca3af",
            fontFamily: "'Arial', sans-serif",
            fontSize: "8pt",
          }}
        >
          Powered by Edufam
        </p>
      </div>
    </div>
  );
});

// Helper function for ordinal suffixes
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;
