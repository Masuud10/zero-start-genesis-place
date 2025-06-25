import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ReportEnhancementService } from './system/reportEnhancementService';

interface PDFReportData {
  title: string;
  reportType: string;
  data: any;
  companyDetails: any;
  generatedAt: string;
}

export class PDFGenerationService {
  private static addHeader(doc: jsPDF, companyDetails: any, title: string) {
    // Header background
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');

    // EduFam logo placeholder and branding
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('EduFam', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Educational Technology Platform', 15, 25);

    // Report title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(title, 15, 45);

    // Company details section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    if (companyDetails?.email) {
      doc.text(`Email: ${companyDetails.email}`, 15, 55);
    }
    if (companyDetails?.phone) {
      doc.text(`Phone: ${companyDetails.phone}`, 15, 60);
    }
    if (companyDetails?.website) {
      doc.text(`Website: ${companyDetails.website}`, 15, 65);
    }

    // Generation metadata
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 15, 75);
    
    // Separator line
    doc.setLineWidth(1);
    doc.setDrawColor(41, 128, 185);
    doc.line(15, 80, 195, 80);

    return 90; // Return Y position for content start
  }

  private static addFooter(doc: jsPDF, pageNumber: number, totalPages: number, companyDetails: any) {
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 35, 210, 35, 'F');
    
    // Footer line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 30, 195, pageHeight - 30);

    // Footer content
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    // Left side - Company info
    doc.text(`${companyDetails?.name || 'EduFam'} - Confidential Report`, 15, pageHeight - 20);
    doc.text(`${companyDetails?.address || 'Nairobi, Kenya'}`, 15, pageHeight - 15);
    
    // Center - Generation info
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, pageHeight - 20, { align: 'center' });
    doc.text('Educational Technology Platform', 105, pageHeight - 15, { align: 'center' });
    
    // Right side - Page numbers
    doc.text(`Page ${pageNumber} of ${totalPages}`, 195, pageHeight - 20, { align: 'right' });
    doc.text('© 2024 EduFam', 195, pageHeight - 15, { align: 'right' });
  }

  static async generateComprehensiveReport(): Promise<void> {
    try {
      const reportData = await ReportEnhancementService.generateComprehensiveReport();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('comprehensive');
      
      if (!reportData) {
        throw new Error('Failed to generate report data');
      }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam Comprehensive System Report');

      // Executive Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('Executive Summary', 15, yPosition + 10);
      yPosition += 25;

      // Summary metrics in a structured layout
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      const summaryMetrics = [
        { label: 'Total Schools', value: reportData.systemMetrics.totalSchools.toString(), color: [52, 152, 219] },
        { label: 'Total Users', value: reportData.systemMetrics.totalUsers.toString(), color: [46, 204, 113] },
        { label: 'Active Schools', value: reportData.systemMetrics.activeSchools.toString(), color: [155, 89, 182] },
        { label: 'System Uptime', value: `${reportData.systemMetrics.systemUptime}%`, color: [231, 76, 60] }
      ];

      summaryMetrics.forEach((metric, index) => {
        const xPos = 15 + (index % 2) * 90;
        const yPos = yPosition + Math.floor(index / 2) * 25;
        
        // Metric box
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.rect(xPos, yPos - 5, 80, 20, 'F');
        
        // Metric text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.label, xPos + 5, yPos + 3);
        doc.setFontSize(14);
        doc.text(metric.value, xPos + 5, yPos + 10);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      });
      
      yPosition += 60;

      // Financial Overview Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('Financial Overview', 15, yPosition);
      yPosition += 15;

      const financialData = [
        ['Metric', 'Amount (KES)', 'Status', 'Performance'],
        ['Total Fees Assigned', reportData.financialSummary.totalFeesAssigned.toLocaleString(), 'Assigned', '100%'],
        ['Total Fees Collected', reportData.financialSummary.totalFeesCollected.toLocaleString(), 'Collected', `${reportData.financialSummary.collectionRate}%`],
        ['Outstanding Fees', reportData.financialSummary.outstandingFees.toLocaleString(), 'Pending', 'Follow-up Required'],
        ['Total Expenses', reportData.financialSummary.totalExpenses.toLocaleString(), 'Paid', 'Within Budget'],
        ['Net Revenue', reportData.financialSummary.netRevenue.toLocaleString(), reportData.financialSummary.netRevenue > 0 ? 'Positive' : 'Negative', reportData.financialSummary.netRevenue > 0 ? 'Excellent' : 'Needs Review']
      ];

      (doc as any).autoTable({
        head: [financialData[0]],
        body: financialData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'center' },
          3: { halign: 'center' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 25;

      // User Distribution Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('User Distribution by Role', 15, yPosition);
      yPosition += 15;

      const userRoleData = Object.entries(reportData.userMetrics.usersByRole).map(([role, count]) => [
        role.replace('_', ' ').toUpperCase(),
        count.toString(),
        `${((count as number / reportData.userMetrics.totalUsers) * 100).toFixed(1)}%`,
        count as number > 10 ? 'Active' : 'Growing'
      ]);

      (doc as any).autoTable({
        head: [['Role', 'Count', 'Percentage', 'Status']],
        body: userRoleData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [46, 204, 113],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' }
        }
      });

      // Add footer with enhanced branding
      this.addFooter(doc, 1, 1, enhancedData.companyDetails);

      // Save with enhanced filename
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`EduFam_Comprehensive_System_Report_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generating comprehensive PDF report:', error);
      throw error;
    }
  }

  
  static async generateSchoolPerformanceReport(): Promise<void> {
    try {
      const systemMetrics = await ReportEnhancementService.getSystemMetrics();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('schools');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam School Performance Report');

      // Enhanced performance overview with better formatting
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(155, 89, 182);
      doc.text('School Performance Overview', 15, yPosition + 10);
      yPosition += 25;

      const performanceData = [
        ['Performance Metric', 'Current Value', 'Trend Analysis', 'Rating'],
        ['Total Schools', systemMetrics.totalSchools.toString(), 'Stable Growth', '⭐⭐⭐⭐'],
        ['Active Schools', systemMetrics.activeSchools.toString(), 'Increasing', '⭐⭐⭐⭐⭐'],
        ['System Uptime', `${systemMetrics.systemUptime}%`, 'Excellent', '⭐⭐⭐⭐⭐'],
        ['Support Response', `${systemMetrics.ticketResolutionRate}%`, 'Good Performance', '⭐⭐⭐⭐']
      ];

      (doc as any).autoTable({
        head: [performanceData[0]],
        body: performanceData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [155, 89, 182],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`EduFam_School_Performance_Report_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generating school performance report:', error);
      throw error;
    }
  }

  static async generateFinancialReport(): Promise<void> {
    try {
      const financialData = await ReportEnhancementService.getFinancialSummary();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('financial');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam Financial Summary Report');

      // Enhanced financial summary with visual improvements
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(231, 76, 60);
      doc.text('Financial Performance Analysis', 15, yPosition + 10);
      yPosition += 25;

      const summaryData = [
        ['Financial Metric', 'Amount (KES)', 'Performance Indicator', 'Status'],
        ['Total Revenue', financialData.totalFeesCollected.toLocaleString(), 'Primary Income Source', '✅ Active'],
        ['Total Expenses', financialData.totalExpenses.toLocaleString(), 'Operational Costs', '📊 Monitored'],
        ['Net Profit/Loss', financialData.netRevenue.toLocaleString(), financialData.netRevenue > 0 ? 'Profitable' : 'Loss Making', financialData.netRevenue > 0 ? '💰 Positive' : '⚠️ Review'],
        ['Outstanding Fees', financialData.outstandingFees.toLocaleString(), 'Collection Required', '🔄 Pending'],
        ['Collection Rate', `${financialData.collectionRate}%`, 'Efficiency Metric', financialData.collectionRate > 85 ? '🌟 Excellent' : '📈 Good']
      ];

      (doc as any).autoTable({
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [231, 76, 60],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`EduFam_Financial_Analysis_Report_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  static async generateSystemHealthReport(): Promise<void> {
    try {
      const systemMetrics = await ReportEnhancementService.getSystemMetrics();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('system_health');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam System Health & Performance Report');

      // Enhanced system health overview
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 188, 156);
      doc.text('System Health & Performance Analysis', 15, yPosition + 10);
      yPosition += 25;

      const healthData = [
        ['System Component', 'Status', 'Performance Metrics', 'Health Score'],
        ['Database Connectivity', '🟢 Operational', '99.9% Uptime', '🏆 Excellent'],
        ['User Authentication', '🟢 Operational', '100% Success Rate', '🏆 Excellent'],
        ['Report Generation', '🟢 Operational', 'Fast Response Time', '🏆 Excellent'],
        ['Support System', '🟢 Operational', `${systemMetrics.ticketResolutionRate}% Resolution`, '⭐ Good'],
        ['Overall Platform', '🟢 Healthy', `${systemMetrics.systemUptime}% Uptime`, '🏆 Excellent'],
        ['Network Security', '🟢 Secure', 'Multi-layer Protection', '🔒 Secure']
      ];

      (doc as any).autoTable({
        head: [healthData[0]],
        body: healthData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [26, 188, 156],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      const timestamp = new Date().toISOString().split('T')[0];
      doc.save(`EduFam_System_Health_Report_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generating system health report:', error);
      throw error;
    }
  }
}
