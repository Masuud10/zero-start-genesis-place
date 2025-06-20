
import React, { useRef } from 'react';
import { Certificate } from '@/types/certificate';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import CertificateTemplate from './CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateViewerProps {
  certificate: Certificate;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ certificate }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const studentName = certificate.performance.student.name.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`certificate_${studentName}_${certificate.academic_year}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    if (!certificateRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${certificate.performance.student.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: serif; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${certificateRef.current.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <CertificateTemplate
        ref={certificateRef}
        certificate={certificate}
        className="shadow-lg"
      />
    </div>
  );
};

export default CertificateViewer;
