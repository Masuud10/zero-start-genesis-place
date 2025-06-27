
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

      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timetable - ${classData?.name || 'Class'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .school-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .class-name {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .term-info {
              font-size: 14px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: center;
              vertical-align: top;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .time-slot {
              font-family: monospace;
              font-size: 12px;
              font-weight: bold;
            }
            .subject {
              font-weight: bold;
              color: #2563eb;
              font-size: 11px;
            }
            .teacher {
              color: #666;
              font-size: 10px;
            }
            .room {
              background: #f3f4f6;
              border-radius: 3px;
              padding: 1px 4px;
              font-size: 9px;
              margin-top: 2px;
              display: inline-block;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${schoolData?.name || 'School Name'}</div>
            <div class="class-name">Class Timetable - ${classData?.name || 'Class Name'}</div>
            <div class="term-info">${term} | Academic Year ${new Date().getFullYear()}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th width="12%">Time</th>
                ${days.map(day => `<th width="17.6%" style="text-transform: capitalize;">${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${timeSlots.slice(0, -1).map((startTime, index) => {
                const endTime = timeSlots[index + 1];
                return `
                  <tr>
                    <td class="time-slot">${formatTime(startTime)}<br/>-<br/>${formatTime(endTime)}</td>
                    ${days.map(day => {
                      const entry = getTimetableEntry(day, startTime);
                      if (entry) {
                        return `
                          <td>
                            <div class="subject">${entry.subjects?.name || 'Subject'}</div>
                            <div class="teacher">${entry.profiles?.name || 'Teacher'}</div>
                            ${entry.room ? `<div class="room">${entry.room}</div>` : ''}
                          </td>
                        `;
                      } else {
                        return '<td style="color: #ccc;">-</td>';
                      }
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            ${schoolData?.address ? `<p>${schoolData.address}</p>` : ''}
            <p>
              ${schoolData?.phone ? `Tel: ${schoolData.phone}` : ''}
              ${schoolData?.phone && schoolData?.email ? ' | ' : ''}
              ${schoolData?.email ? `Email: ${schoolData.email}` : ''}
            </p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      toast({
        title: "PDF Generated",
        description: "Timetable PDF is ready for download/print.",
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
    <Button onClick={generatePDF} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  );
};

export default TimetablePDFExport;
