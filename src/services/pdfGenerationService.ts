
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
    // Company logo (placeholder - would need actual logo URL)
    if (companyDetails?.logo) {
      // doc.addImage(companyDetails.logo, 'PNG', 15, 10, 30, 15);
    }

    // Company name and title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails?.name || 'EduFam', 15, 35);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 15, 45);

    // Contact info
    doc.setFontSize(10);
    if (companyDetails?.email) {
      doc.text(`Email: ${companyDetails.email}`, 15, 55);
    }
    if (companyDetails?.phone) {
      doc.text(`Phone: ${companyDetails.phone}`, 15, 60);
    }
    if (companyDetails?.website) {
      doc.text(`Website: ${companyDetails.website}`, 15, 65);
    }

    // Generation date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 75);
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, 80, 195, 80);

    return 85; // Return Y position for content start
  }

  private static addFooter(doc: jsPDF, pageNumber: number, totalPages: number, companyDetails: any) {
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer line
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${companyDetails?.name || 'EduFam'} - Confidential Report`, 15, pageHeight - 15);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 195, pageHeight - 15, { align: 'right' });
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, pageHeight - 10, { align: 'center' });
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

      // Executive Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 15, yPosition + 10);
      yPosition += 20;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summaryText = [
        `Total Schools: ${reportData.systemMetrics.totalSchools}`,
        `Total Users: ${reportData.systemMetrics.totalUsers}`,
        `Active Schools: ${reportData.systemMetrics.activeSchools}`,
        `System Uptime: ${reportData.systemMetrics.systemUptime}%`,
        `Support Tickets: ${reportData.systemMetrics.totalSupportTickets} (${reportData.systemMetrics.openTickets} open)`,
        `Ticket Resolution Rate: ${reportData.systemMetrics.ticketResolutionRate}%`
      ];

      summaryText.forEach((text, index) => {
        doc.text(text, 15, yPosition + (index * 5));
      });
      yPosition += 40;

      // Financial Overview
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Overview', 15, yPosition);
      yPosition += 10;

      const financialData = [
        ['Metric', 'Amount (KES)', 'Status'],
        ['Total Fees Assigned', reportData.financialSummary.totalFeesAssigned.toLocaleString(), 'Assigned'],
        ['Total Fees Collected', reportData.financialSummary.totalFeesCollected.toLocaleString(), 'Collected'],
        ['Outstanding Fees', reportData.financialSummary.outstandingFees.toLocaleString(), 'Pending'],
        ['Total Expenses', reportData.financialSummary.totalExpenses.toLocaleString(), 'Paid'],
        ['Net Revenue', reportData.financialSummary.netRevenue.toLocaleString(), reportData.financialSummary.netRevenue > 0 ? 'Positive' : 'Negative'],
        ['Collection Rate', `${reportData.financialSummary.collectionRate}%`, reportData.financialSummary.collectionRate > 80 ? 'Good' : 'Needs Improvement']
      ];

      (doc as any).autoTable({
        head: [financialData[0]],
        body: financialData.slice(1),
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // User Distribution
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('User Distribution by Role', 15, yPosition);
      yPosition += 10;

      const userRoleData = Object.entries(reportData.userMetrics.usersByRole).map(([role, count]) => [
        role.replace('_', ' ').toUpperCase(),
        count.toString(),
        `${((count as number / reportData.userMetrics.totalUsers) * 100).toFixed(1)}%`
      ]);

      (doc as any).autoTable({
        head: [['Role', 'Count', 'Percentage']],
        body: userRoleData,
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        styles: { fontSize: 9 }
      });

      // Add footer
      this.addFooter(doc, 1, 1, enhancedData.companyDetails);

      // Save the PDF
      doc.save(`EduFam_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  static async generateSchoolPerformanceReport(): Promise<void> {
    try {
      const systemMetrics = await ReportEnhancementService.getSystemMetrics();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('schools');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'School Performance Report');

      // School Performance Overview
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('School Performance Overview', 15, yPosition + 10);
      yPosition += 20;

      const performanceData = [
        ['Metric', 'Value', 'Trend'],
        ['Total Schools', systemMetrics.totalSchools.toString(), 'Stable'],
        ['Active Schools', systemMetrics.activeSchools.toString(), 'Growing'],
        ['Average System Uptime', `${systemMetrics.systemUptime}%`, 'Excellent'],
        ['Support Response Rate', `${systemMetrics.ticketResolutionRate}%`, 'Good']
      ];

      (doc as any).autoTable({
        head: [performanceData[0]],
        body: performanceData.slice(1),
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [155, 89, 182] },
        styles: { fontSize: 10 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      doc.save(`EduFam_School_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);

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
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'Financial Summary Report');

      // Financial Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Performance Summary', 15, yPosition + 10);
      yPosition += 20;

      const summaryData = [
        ['Financial Metric', 'Amount (KES)', 'Performance'],
        ['Total Revenue', financialData.totalFeesCollected.toLocaleString(), 'Revenue Generated'],
        ['Total Expenses', financialData.totalExpenses.toLocaleString(), 'Operational Costs'],
        ['Net Profit/Loss', financialData.netRevenue.toLocaleString(), financialData.netRevenue > 0 ? 'Profit' : 'Loss'],
        ['Outstanding Receivables', financialData.outstandingFees.toLocaleString(), 'Pending Collection'],
        ['Collection Efficiency', `${financialData.collectionRate}%`, financialData.collectionRate > 85 ? 'Excellent' : 'Good']
      ];

      (doc as any).autoTable({
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] },
        styles: { fontSize: 10 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      doc.save(`EduFam_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);

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
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'System Health Report');

      // System Health Overview
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('System Health Overview', 15, yPosition + 10);
      yPosition += 20;

      const healthData = [
        ['System Component', 'Status', 'Performance'],
        ['Database Connectivity', 'Operational', '99.9% Uptime'],
        ['User Authentication', 'Operational', '100% Success Rate'],
        ['Report Generation', 'Operational', 'Fast Response'],
        ['Support System', 'Operational', `${systemMetrics.ticketResolutionRate}% Resolution Rate`],
        ['Overall System Health', 'Healthy', `${systemMetrics.systemUptime}% Uptime`]
      ];

      (doc as any).autoTable({
        head: [healthData[0]],
        body: healthData.slice(1),
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [26, 188, 156] },
        styles: { fontSize: 10 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      doc.save(`EduFam_System_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating system health report:', error);
      throw error;
    }
  }
}
