
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetablePDFExportProps {
  timetableData: any[];
  classData: any;
  schoolData: any;
  term: string;
}

const TimetablePDFExport: React.FC<TimetablePDFExportProps> = ({
  timetableData,
  classData,
  schoolData,
  term
}) => {
  const { toast } = useToast();

  const generatePDF = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const timeSlots = [
        '08:00', '08:40', '09:20', '10:00', '10:40', '11:20', 
        '12:00', '12:40', '13:20', '14:00', '14:40', '15:20'
      ];

      const formatTime = (time: string) => time.substring(0, 5);

      const getTimetableEntry = (day: string, startTime: string) => {
        return timetableData.find(entry => 
          entry.day_of_week === day && entry.start_time === startTime
        );
      };

      // Generate comprehensive HTML content with enhanced styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timetable - ${classData?.name || 'Class'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              margin: 15px;
              background: white;
              color: #333;
              line-height: 1.4;
            }
            
            .header {
              text-align: center;
              margin-bottom: 25px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            
            .logo-section {
              margin-bottom: 15px;
            }
            
            .school-name {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .school-details {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 15px;
            }
            
            .timetable-title {
              font-size: 22px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
            }
            
            .term-info {
              font-size: 16px;
              color: #6b7280;
              font-weight: 500;
            }
            
            .timetable-container {
              overflow-x: auto;
              margin: 20px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            th, td {
              border: 1px solid #d1d5db;
              padding: 10px 8px;
              text-align: center;
              vertical-align: top;
              font-size: 11px;
            }
            
            th {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 12px;
            }
            
            .time-slot {
              background: #f8fafc;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              font-weight: 600;
              color: #475569;
              width: 100px;
              border-right: 2px solid #e2e8f0;
            }
            
            .subject-cell {
              min-height: 60px;
              position: relative;
            }
            
            .subject {
              font-weight: 700;
              color: #1e40af;
              font-size: 11px;
              margin-bottom: 3px;
              text-transform: uppercase;
            }
            
            .teacher {
              color: #059669;
              font-size: 10px;
              font-weight: 500;
              margin-bottom: 2px;
            }
            
            .room {
              background: #e0f2fe;
              color: #0369a1;
              border-radius: 4px;
              padding: 2px 6px;
              font-size: 9px;
              font-weight: 600;
              display: inline-block;
              margin-top: 2px;
              border: 1px solid #bae6fd;
            }
            
            .empty-cell {
              color: #9ca3af;
              font-style: italic;
              font-size: 10px;
              background: #fafafa;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            
            .generation-info {
              margin-bottom: 10px;
              font-weight: 500;
            }
            
            .contact-info {
              margin-top: 10px;
            }
            
            .break-row {
              background: #fef3c7 !important;
            }
            
            .break-row td {
              color: #d97706;
              font-weight: 600;
              font-size: 11px;
            }
            
            @media print {
              body { 
                margin: 0; 
                font-size: 10px;
              }
              .no-print { 
                display: none; 
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
              }
            }
            
            @page {
              size: A3 landscape;
              margin: 1cm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              ${schoolData?.logo_url ? `<img src="${schoolData.logo_url}" alt="School Logo" style="height: 60px; margin-bottom: 10px;">` : ''}
            </div>
            <div class="school-name">${schoolData?.name || 'School Name'}</div>
            <div class="school-details">
              ${schoolData?.address ? `${schoolData.address}` : ''}
              ${schoolData?.phone ? ` | Tel: ${schoolData.phone}` : ''}
              ${schoolData?.email ? ` | Email: ${schoolData.email}` : ''}
            </div>
            <div class="timetable-title">Class Timetable - ${classData?.name || 'Class Name'}</div>
            <div class="term-info">
              ${term} | Academic Year ${new Date().getFullYear()} | 
              ${schoolData?.curriculum_type ? `Curriculum: ${schoolData.curriculum_type.toUpperCase()}` : ''}
            </div>
          </div>
          
          <div class="timetable-container">
            <table>
              <thead>
                <tr>
                  <th class="time-slot">Time Period</th>
                  ${days.map(day => `<th style="text-transform: capitalize; min-width: 120px;">${day}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${timeSlots.slice(0, -1).map((startTime, index) => {
                  const endTime = timeSlots[index + 1];
                  
                  // Add break periods
                  if (startTime === '10:40') {
                    return `
                      <tr class="break-row">
                        <td class="time-slot">10:40 - 11:00</td>
                        <td colspan="5">☕ TEA BREAK</td>
                      </tr>
                      <tr>
                        <td class="time-slot">${formatTime(startTime)}<br/>-<br/>${formatTime(endTime)}</td>
                        ${days.map(day => {
                          const entry = getTimetableEntry(day, startTime);
                          if (entry) {
                            return `
                              <td class="subject-cell">
                                <div class="subject">${entry.subjects?.name || 'Subject'}</div>
                                <div class="teacher">${entry.profiles?.name || 'Teacher'}</div>
                                ${entry.room ? `<div class="room">${entry.room}</div>` : ''}
                              </td>
                            `;
                          } else {
                            return '<td class="empty-cell">Free Period</td>';
                          }
                        }).join('')}
                      </tr>
                    `;
                  } else if (startTime === '12:40') {
                    return `
                      <tr class="break-row">
                        <td class="time-slot">12:40 - 13:20</td>
                        <td colspan="5">🍽️ LUNCH BREAK</td>
                      </tr>
                      <tr>
                        <td class="time-slot">${formatTime(startTime)}<br/>-<br/>${formatTime(endTime)}</td>
                        ${days.map(day => {
                          const entry = getTimetableEntry(day, startTime);
                          if (entry) {
                            return `
                              <td class="subject-cell">
                                <div class="subject">${entry.subjects?.name || 'Subject'}</div>
                                <div class="teacher">${entry.profiles?.name || 'Teacher'}</div>
                                ${entry.room ? `<div class="room">${entry.room}</div>` : ''}
                              </td>
                            `;
                          } else {
                            return '<td class="empty-cell">Free Period</td>';
                          }
                        }).join('')}
                      </tr>
                    `;
                  } else {
                    return `
                      <tr>
                        <td class="time-slot">${formatTime(startTime)}<br/>-<br/>${formatTime(endTime)}</td>
                        ${days.map(day => {
                          const entry = getTimetableEntry(day, startTime);
                          if (entry) {
                            return `
                              <td class="subject-cell">
                                <div class="subject">${entry.subjects?.name || 'Subject'}</div>
                                <div class="teacher">${entry.profiles?.name || 'Teacher'}</div>
                                ${entry.room ? `<div class="room">${entry.room}</div>` : ''}
                              </td>
                            `;
                          } else {
                            return '<td class="empty-cell">Free Period</td>';
                          }
                        }).join('')}
                      </tr>
                    `;
                  }
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <div class="generation-info">
              <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at ${new Date().toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div class="contact-info">
              <p><strong>School Management System:</strong> EduFam</p>
              ${schoolData?.motto ? `<p><em>"${schoolData.motto}"</em></p>` : ''}
              <p style="margin-top: 10px; font-size: 10px; color: #9ca3af;">
                This timetable is computer-generated and subject to changes. Please verify with the administration for any updates.
              </p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
            
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      toast({
        title: "PDF Generated Successfully",
        description: "Professional timetable PDF is ready for download and printing.",
      });

    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="bg-orange-50 hover:bg-orange-100 border-orange-200">
      <Download className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  );
};

export default TimetablePDFExport;
