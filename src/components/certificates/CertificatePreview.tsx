import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface CertificateTemplate {
  id: number;
  template_name: string;
  template_type: string;
  title_text: string;
  body_text: string;
  signature_1_name: string;
  signature_2_name: string;
  layout_config: {
    font_family: string;
    border_style: string;
    background_color: string;
    seal_image_url?: string;
  };
  created_at: string;
}

interface CertificatePreviewProps {
  template: CertificateTemplate;
  onClose: () => void;
  showBackButton?: boolean;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  template,
  onClose,
  showBackButton = false
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would integrate with the PDF generation logic
    // For now, just trigger print dialog
    window.print();
  };

  // Sample data for preview
  const sampleData = {
    student_name: 'John Doe',
    student_id: 'STU-2024-001',
    class: 'Form 3A',
    school_name: 'Sample School',
    reason: 'outstanding academic performance',
    date: new Date().toLocaleDateString(),
    academic_year: '2024'
  };

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\{\{student_name\}\}/g, sampleData.student_name)
      .replace(/\{\{student_id\}\}/g, sampleData.student_id)
      .replace(/\{\{class\}\}/g, sampleData.class)
      .replace(/\{\{school_name\}\}/g, sampleData.school_name)
      .replace(/\{\{reason\}\}/g, sampleData.reason)
      .replace(/\{\{date\}\}/g, sampleData.date)
      .replace(/\{\{academic_year\}\}/g, sampleData.academic_year);
  };

  const getBorderClass = (style: string) => {
    switch (style) {
      case 'classic':
        return 'border-4 border-double border-gray-800';
      case 'modern':
        return 'border-2 border-blue-500';
      case 'minimalist':
        return 'border border-gray-300';
      case 'ornate':
        return 'border-8 border-yellow-400';
      default:
        return 'border border-gray-300';
    }
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'sans-serif':
        return 'font-sans';
      case 'script':
        return 'font-mono'; // Using mono as placeholder for script
      default:
        return 'font-serif';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {showBackButton ? 'Back to Editor' : 'Back to Templates'}
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Certificate Preview</h2>
            <p className="text-muted-foreground">{template.template_name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview - {template.template_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div 
              id="certificate-preview"
              className={`
                w-[800px] h-[600px] p-12 bg-white shadow-xl
                ${getBorderClass(template.layout_config.border_style)}
                ${getFontFamily(template.layout_config.font_family)}
              `}
              style={{ 
                backgroundColor: template.layout_config.background_color,
                fontFamily: template.layout_config.font_family === 'serif' ? 'serif' : 
                            template.layout_config.font_family === 'sans-serif' ? 'sans-serif' : 
                            'cursive'
              } as React.CSSProperties}
            >
              <div className="h-full flex flex-col justify-between text-center">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-8">
                    {template.layout_config.seal_image_url && (
                      <img 
                        src={template.layout_config.seal_image_url} 
                        alt="School Seal" 
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{sampleData.school_name}</h1>
                      <p className="text-sm text-gray-600">Academic Institution</p>
                    </div>
                    {template.layout_config.seal_image_url && (
                      <div className="w-16 h-16"></div> // Spacer for symmetry
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                  <h2 className="text-4xl font-bold text-center">
                    {replacePlaceholders(template.title_text)}
                  </h2>
                  
                  <div className="space-y-6">
                    <p className="text-lg leading-relaxed max-w-2xl mx-auto">
                      {replacePlaceholders(template.body_text)}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-8 text-sm max-w-md mx-auto">
                      <div>
                        <p><strong>Student ID:</strong> {sampleData.student_id}</p>
                        <p><strong>Class:</strong> {sampleData.class}</p>
                      </div>
                      <div>
                        <p><strong>Academic Year:</strong> {sampleData.academic_year}</p>
                        <p><strong>Date Issued:</strong> {sampleData.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer - Signatures */}
                <div className="space-y-8">
                  <div className="flex justify-between items-end max-w-lg mx-auto">
                    <div className="text-center">
                      <div className="w-32 border-b border-gray-400 mb-2"></div>
                      <p className="text-sm font-medium">
                        {replacePlaceholders(template.signature_1_name)}
                      </p>
                      <p className="text-xs text-gray-600">Principal</p>
                    </div>
                    <div className="text-center">
                      <div className="w-32 border-b border-gray-400 mb-2"></div>
                      <p className="text-sm font-medium">
                        {replacePlaceholders(template.signature_2_name)}
                      </p>
                      <p className="text-xs text-gray-600">Class Teacher</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Certificate ID: CERT-{template.id}-{Date.now()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatePreview;