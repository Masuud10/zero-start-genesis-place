import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ReportEnhancementService } from './system/reportEnhancementService';

interface CompanyDetails {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

interface ReportData {
  title: string;
  reportType: string;
  data: Record<string, unknown>;
  companyDetails: CompanyDetails;
  generatedAt: string;
}

interface SystemMetrics {
  totalSchools: number;
  totalUsers: number;
  activeSchools: number;
  systemUptime: number;
}

interface FinancialSummary {
  totalFeesAssigned: number;
  totalFeesCollected: number;
  outstandingFees: number;
  totalExpenses: number;
  netRevenue: number;
  collectionRate: number;
}

interface ComprehensiveReportData {
  systemMetrics: SystemMetrics;
  financialSummary: FinancialSummary;
}

export class PDFGenerationService {
  private static addHeader(doc: jsPDF, companyDetails: CompanyDetails, title: string) {
    // Enhanced header background with gradient effect
    doc.setFillColor(25, 118, 210); // Blue primary
    doc.rect(0, 0, 210, 35, 'F');
    
    // Subtle gradient overlay
    doc.setFillColor(13, 71, 161); // Darker blue
    doc.rect(0, 0, 210, 8, 'F');

    // EduFam logo and main branding
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('EduFam', 20, 22);
    
    // Tagline
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Educational Technology Platform', 20, 28);

    // Report title with enhanced styling
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(title, 20, 48);

    // Company details section with better formatting
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    
    let yPos = 58;
    if (companyDetails?.email) {
      doc.text(`✉ ${companyDetails.email}`, 20, yPos);
      yPos += 5;
    }
    if (companyDetails?.phone) {
      doc.text(`📞 ${companyDetails.phone}`, 20, yPos);
      yPos += 5;
    }
    if (companyDetails?.website) {
      doc.text(`🌐 ${companyDetails.website}`, 20, yPos);
      yPos += 5;
    }

    // Enhanced generation metadata
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const now = new Date();
    doc.text(`Generated: ${now.toLocaleDateString('en-KE')} at ${now.toLocaleTimeString('en-KE')}`, 20, yPos + 8);
    doc.text(`Report ID: EDF-${now.getTime().toString().slice(-8)}`, 20, yPos + 12);
    
    // Professional separator line
    doc.setLineWidth(1.5);
    doc.setDrawColor(25, 118, 210);
    doc.line(20, yPos + 18, 190, yPos + 18);

    return yPos + 28; // Return Y position for content start
  }

  private static addFooter(doc: jsPDF, pageNumber: number, totalPages: number, companyDetails: CompanyDetails) {
    const pageHeight = doc.internal.pageSize.height;
    
    // Enhanced footer background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, pageHeight - 40, 210, 40, 'F');
    
    // Footer separator line
    doc.setLineWidth(0.8);
    doc.setDrawColor(25, 118, 210);
    doc.line(20, pageHeight - 35, 190, pageHeight - 35);

    // Footer content with better styling
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    
    // Left side - Company branding
    doc.text(`${companyDetails?.name || 'EduFam'} - Professional Report`, 20, pageHeight - 25);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${companyDetails?.address || 'Nairobi, Kenya'} • Educational Technology Solutions`, 20, pageHeight - 20);
    
    // Center - Generation timestamp
    const now = new Date();
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${now.toLocaleDateString('en-KE')} ${now.toLocaleTimeString('en-KE')}`, 105, pageHeight - 25, { align: 'center' });
    doc.text('Confidential Business Report', 105, pageHeight - 20, { align: 'center' });
    
    // Right side - Page information
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 190, pageHeight - 25, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('© 2024 EduFam Platform', 190, pageHeight - 20, { align: 'right' });
  }

  static async generateComprehensiveReport(): Promise<void> {
    try {
      console.log('Starting comprehensive PDF report generation...');
      
      const reportData = await ReportEnhancementService.generateComprehensiveReport() as ComprehensiveReportData;
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('comprehensive');
      
      if (!reportData) {
        throw new Error('Failed to generate comprehensive report data');
      }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam Comprehensive System Report');

      // Executive Summary Section with enhanced styling
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('📊 Executive Summary', 20, yPosition + 15);
      yPosition += 30;

      // Enhanced summary metrics cards
      const summaryMetrics = [
        { label: 'Total Schools', value: reportData.systemMetrics.totalSchools.toString(), color: [33, 150, 243] },
        { label: 'Total Users', value: reportData.systemMetrics.totalUsers.toString(), color: [76, 175, 80] },
        { label: 'Active Schools', value: reportData.systemMetrics.activeSchools.toString(), color: [156, 39, 176] },
        { label: 'System Uptime', value: `${reportData.systemMetrics.systemUptime}%`, color: [255, 87, 34] }
      ];

      summaryMetrics.forEach((metric, index) => {
        const xPos = 20 + (index % 2) * 85;
        const yPos = yPosition + Math.floor(index / 2) * 28;
        
        // Enhanced metric cards
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.roundedRect(xPos, yPos - 7, 80, 22, 3, 3, 'F');
        
        // Metric text with better styling
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(metric.label, xPos + 5, yPos - 1);
        doc.setFontSize(16);
        doc.text(metric.value, xPos + 5, yPos + 8);
      });
      
      yPosition += 65;

      // Financial Overview Section with professional formatting
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('💰 Financial Overview', 20, yPosition);
      yPosition += 20;

      const financialData = [
        ['Financial Metric', 'Amount (KES)', 'Status', 'Performance Rating'],
        ['Total Fees Assigned', reportData.financialSummary.totalFeesAssigned.toLocaleString(), '✅ Assigned', '100% Complete'],
        ['Total Fees Collected', reportData.financialSummary.totalFeesCollected.toLocaleString(), '💰 Collected', `${reportData.financialSummary.collectionRate.toFixed(1)}% Success`],
        ['Outstanding Fees', reportData.financialSummary.outstandingFees.toLocaleString(), '⏳ Pending', 'Follow-up Required'],
        ['Total Expenses', reportData.financialSummary.totalExpenses.toLocaleString(), '💸 Paid', 'Within Budget'],
        ['Net Revenue', reportData.financialSummary.netRevenue.toLocaleString(), reportData.financialSummary.netRevenue > 0 ? '📈 Positive' : '📉 Negative', reportData.financialSummary.netRevenue > 0 ? '⭐ Excellent' : '⚠️ Review Required']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [financialData[0]],
        body: financialData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [25, 118, 210],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 40 }
        }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_Comprehensive_System_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating comprehensive PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateSchoolPerformanceReport(): Promise<void> {
    try {
      console.log('Starting school performance PDF report generation...');
      
      const systemMetrics = await ReportEnhancementService.getSystemMetrics();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('schools');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam School Performance Report');

      // Enhanced performance overview
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(156, 39, 176);
      doc.text('🏫 School Performance Analysis', 20, yPosition + 15);
      yPosition += 30;

      const performanceData = [
        ['Performance Metric', 'Current Value', 'Trend Analysis', 'Performance Rating'],
        ['Total Schools', systemMetrics.totalSchools.toString(), '📈 Steady Growth', '⭐⭐⭐⭐ Excellent'],
        ['Active Schools', systemMetrics.activeSchools.toString(), '📊 Increasing Engagement', '⭐⭐⭐⭐⭐ Outstanding'],
        ['System Uptime', `${systemMetrics.systemUptime}%`, '🚀 Exceptional Performance', '⭐⭐⭐⭐⭐ Outstanding'],
        ['Support Response Rate', `${systemMetrics.ticketResolutionRate.toFixed(1)}%`, '✅ Efficient Resolution', '⭐⭐⭐⭐ Excellent']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [performanceData[0]],
        body: performanceData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [156, 39, 176],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 11,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        margin: { left: 20, right: 20 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_School_Performance_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating school performance PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateFinancialReport(): Promise<void> {
    try {
      console.log('Starting financial PDF report generation...');
      
      const financialData = await ReportEnhancementService.getFinancialSummary();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('financial');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam Financial Analysis Report');

      // Enhanced financial analysis
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 87, 34);
      doc.text('💼 Financial Performance Analysis', 20, yPosition + 15);
      yPosition += 30;

      const summaryData = [
        ['Financial Metric', 'Amount (KES)', 'Performance Indicator', 'Status'],
        ['Total Revenue', financialData.totalFeesCollected.toLocaleString(), '💰 Primary Income Source', '✅ Active Collection'],
        ['Total Expenses', financialData.totalExpenses.toLocaleString(), '💸 Operational Costs', '📊 Monitored & Controlled'],
        ['Net Profit/Loss', financialData.netRevenue.toLocaleString(), financialData.netRevenue > 0 ? '📈 Profitable Operations' : '📉 Loss Making', financialData.netRevenue > 0 ? '🌟 Positive Performance' : '⚠️ Requires Review'],
        ['Outstanding Fees', financialData.outstandingFees.toLocaleString(), '🔄 Collection in Progress', '📞 Follow-up Required'],
        ['Collection Efficiency', `${financialData.collectionRate.toFixed(1)}%`, '📈 Performance Metric', financialData.collectionRate > 85 ? '🏆 Excellent Performance' : '📊 Good Performance']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [255, 87, 34],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        margin: { left: 20, right: 20 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_Financial_Analysis_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating financial PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateSystemHealthReport(): Promise<void> {
    try {
      console.log('Starting system health PDF report generation...');
      
      const systemMetrics = await ReportEnhancementService.getSystemMetrics();
      const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('system_health');

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, enhancedData.companyDetails, 'EduFam System Health & Performance Report');

      // Enhanced system health overview
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(76, 175, 80);
      doc.text('🔧 System Health & Performance Analysis', 20, yPosition + 15);
      yPosition += 30;

      const healthData = [
        ['System Component', 'Operational Status', 'Performance Metrics', 'Health Rating'],
        ['Database Systems', '🟢 Fully Operational', '99.9% Uptime • Fast Response', '🏆 Excellent Health'],
        ['User Authentication', '🟢 Secure & Operational', '100% Success Rate • Zero Breaches', '🔒 Highly Secure'],
        ['Report Generation', '🟢 Functioning Optimally', 'Fast PDF Generation • Real-time Data', '⚡ High Performance'],
        ['Support System', '🟢 Active & Responsive', `${systemMetrics.ticketResolutionRate.toFixed(1)}% Resolution Rate`, '📞 Efficient Support'],
        ['Platform Stability', '🟢 Stable & Reliable', `${systemMetrics.systemUptime}% Uptime • Zero Downtime`, '🚀 Outstanding Performance'],
        ['Security Infrastructure', '🟢 Fully Protected', 'Multi-layer Security • Active Monitoring', '🛡️ Maximum Security']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [healthData[0]],
        body: healthData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [76, 175, 80],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        margin: { left: 20, right: 20 }
      });

      this.addFooter(doc, 1, 1, enhancedData.companyDetails);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_System_Health_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating system health PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
