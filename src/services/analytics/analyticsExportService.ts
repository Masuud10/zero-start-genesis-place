import { SystemAnalyticsData, AnalyticsFilters } from './systemAnalyticsService';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json';
  includeCharts: boolean;
  includeTables: boolean;
  dateRange?: string;
  filters?: AnalyticsFilters;
}

export class AnalyticsExportService {
  static async exportToPDF(analyticsData: SystemAnalyticsData, options: ExportOptions): Promise<Blob> {
    console.log('📊 AnalyticsExportService: Exporting to PDF');
    
    try {
      // Create PDF content using jsPDF or similar library
      const pdfContent = this.generatePDFContent(analyticsData, options);
      
      // For now, return a JSON blob as PDF (in real implementation, use jsPDF)
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      return blob;
    } catch (error) {
      console.error('❌ AnalyticsExportService: PDF export error:', error);
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async exportToExcel(analyticsData: SystemAnalyticsData, options: ExportOptions): Promise<Blob> {
    console.log('📊 AnalyticsExportService: Exporting to Excel');
    
    try {
      const excelContent = this.generateExcelContent(analyticsData, options);
      const blob = new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return blob;
    } catch (error) {
      console.error('❌ AnalyticsExportService: Excel export error:', error);
      throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async exportToJSON(analyticsData: SystemAnalyticsData, options: ExportOptions): Promise<Blob> {
    console.log('📊 AnalyticsExportService: Exporting to JSON');
    
    try {
      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          format: 'JSON',
          filters: options.filters,
          generatedBy: 'EduFam System Analytics',
          version: '1.0'
        },
        summary: {
          totalSchools: analyticsData.totalSchools,
          totalUsers: analyticsData.totalUsers,
          totalRevenue: analyticsData.totalRevenue,
          systemUptime: analyticsData.systemUptime,
          lastUpdated: analyticsData.lastUpdated
        },
        detailedData: analyticsData
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      return blob;
    } catch (error) {
      console.error('❌ AnalyticsExportService: JSON export error:', error);
      throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static generatePDFContent(analyticsData: SystemAnalyticsData, options: ExportOptions): string {
    // Generate PDF content with EduFam branding
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EduFam System Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .timestamp { color: #666; font-size: 12px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
            .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .metric-label { color: #666; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f8f9fa; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">EduFam System Analytics</div>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-value">${analyticsData.totalSchools}</div>
                <div class="metric-label">Total Schools</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analyticsData.totalUsers}</div>
                <div class="metric-label">Total Users</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">$${analyticsData.totalRevenue}</div>
                <div class="metric-label">Total Revenue</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${analyticsData.systemUptime}%</div>
                <div class="metric-label">System Uptime</div>
              </div>
            </div>
          </div>

          ${options.includeTables ? this.generateTablesHTML(analyticsData) : ''}

          <div class="footer">
            <p>© 2024 EduFam Platform. All rights reserved.</p>
            <p>This report was generated automatically by the EduFam System Analytics module.</p>
          </div>
        </body>
      </html>
    `;

    return content;
  }

  private static generateExcelContent(analyticsData: SystemAnalyticsData, options: ExportOptions): string {
    // Generate Excel content (CSV format for simplicity)
    const csvContent = [
      // Header
      ['EduFam System Analytics Report'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [''],
      
      // Summary
      ['Executive Summary'],
      ['Metric', 'Value'],
      ['Total Schools', analyticsData.totalSchools],
      ['Total Users', analyticsData.totalUsers],
      ['Total Revenue', `$${analyticsData.totalRevenue}`],
      ['System Uptime', `${analyticsData.systemUptime}%`],
      [''],
      
      // User Analytics
      ['User Analytics'],
      ['Role', 'Count', 'Percentage'],
      ...analyticsData.userRoleDistribution.map(role => [
        role.role,
        role.count,
        `${role.percentage.toFixed(1)}%`
      ]),
      [''],
      
      // School Analytics
      ['School Analytics'],
      ['Status', 'Count'],
      ...analyticsData.schoolsByStatus.map(status => [
        status.status,
        status.count
      ]),
      [''],
      
      // Performance Metrics
      ['System Performance'],
      ['Metric', 'Value', 'Status'],
      ...analyticsData.performanceMetrics.map(metric => [
        metric.metric,
        `${metric.value}%`,
        metric.status
      ])
    ].map(row => row.join(',')).join('\n');

    return csvContent;
  }

  private static generateTablesHTML(analyticsData: SystemAnalyticsData): string {
    return `
      <div class="section">
        <div class="section-title">User Role Distribution</div>
        <table class="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsData.userRoleDistribution.map(role => `
              <tr>
                <td>${role.role}</td>
                <td>${role.count}</td>
                <td>${role.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">School Status Distribution</div>
        <table class="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsData.schoolsByStatus.map(status => `
              <tr>
                <td>${status.status}</td>
                <td>${status.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">System Performance Metrics</div>
        <table class="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsData.performanceMetrics.map(metric => `
              <tr>
                <td>${metric.metric}</td>
                <td>${metric.value}%</td>
                <td>${metric.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  static generateFilename(format: string, dateRange?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const rangeSuffix = dateRange ? `-${dateRange}` : '';
    return `edufam-analytics-${timestamp}${rangeSuffix}.${format}`;
  }
} 