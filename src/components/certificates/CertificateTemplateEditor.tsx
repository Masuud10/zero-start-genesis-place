import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import CertificatePreview from './CertificatePreview';

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

interface CertificateTemplateEditorProps {
  template?: CertificateTemplate | null;
  onSave: (templateData: any) => void;
  onCancel: () => void;
}

const CertificateTemplateEditor: React.FC<CertificateTemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    template_name: '',
    template_type: 'academic',
    title_text: 'Certificate of Achievement',
    body_text: 'This certificate is proudly presented to {{student_name}} for {{reason}}.',
    signature_1_name: "Principal's Name",
    signature_2_name: "Teacher's Name",
    layout_config: {
      font_family: 'serif',
      border_style: 'classic',
      background_color: '#FFFFFF',
      seal_image_url: ''
    }
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name,
        template_type: template.template_type,
        title_text: template.title_text,
        body_text: template.body_text,
        signature_1_name: template.signature_1_name,
        signature_2_name: template.signature_2_name,
        layout_config: {
          ...template.layout_config,
          seal_image_url: template.layout_config.seal_image_url || ''
        }
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLayoutChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      layout_config: {
        ...prev.layout_config,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const previewTemplate = {
    ...formData,
    id: template?.id || 0,
    created_at: template?.created_at || new Date().toISOString()
  };

  if (showPreview) {
    return (
      <CertificatePreview
        template={previewTemplate}
        onClose={() => setShowPreview(false)}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <p className="text-muted-foreground">
            Design a customizable certificate template for your school
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Template Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                
                <div>
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => handleInputChange('template_name', e.target.value)}
                    placeholder="e.g., Academic Excellence Award"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => handleInputChange('template_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="extracurricular">Extracurricular</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="participation">Participation</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Content</h3>
                 <p className="text-sm text-muted-foreground">
                   You can use placeholders: {`{{student_name}}, {{reason}}, {{school_name}}, {{date}}, {{class}}`}
                 </p>
                
                <div>
                  <Label htmlFor="title_text">Certificate Title</Label>
                  <Input
                    id="title_text"
                    value={formData.title_text}
                    onChange={(e) => handleInputChange('title_text', e.target.value)}
                    placeholder="Certificate of Achievement"
                  />
                </div>

                <div>
                  <Label htmlFor="body_text">Certificate Body Text</Label>
                  <Textarea
                    id="body_text"
                    value={formData.body_text}
                    onChange={(e) => handleInputChange('body_text', e.target.value)}
                    placeholder="This certificate is proudly presented to {{student_name}} for {{reason}}."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="signature_1_name">Primary Signature Name</Label>
                  <Input
                    id="signature_1_name"
                    value={formData.signature_1_name}
                    onChange={(e) => handleInputChange('signature_1_name', e.target.value)}
                    placeholder="Principal's Name"
                  />
                </div>

                <div>
                  <Label htmlFor="signature_2_name">Secondary Signature Name</Label>
                  <Input
                    id="signature_2_name"
                    value={formData.signature_2_name}
                    onChange={(e) => handleInputChange('signature_2_name', e.target.value)}
                    placeholder="Teacher's Name"
                  />
                </div>
              </div>

              {/* Design Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Design Settings</h3>
                
                <div>
                  <Label htmlFor="font_family">Font Family</Label>
                  <Select
                    value={formData.layout_config.font_family}
                    onValueChange={(value) => handleLayoutChange('font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Traditional)</SelectItem>
                      <SelectItem value="sans-serif">Sans-serif (Modern)</SelectItem>
                      <SelectItem value="script">Script (Elegant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="border_style">Border Style</Label>
                  <Select
                    value={formData.layout_config.border_style}
                    onValueChange={(value) => handleLayoutChange('border_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="ornate">Ornate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="background_color">Background Color</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.layout_config.background_color}
                    onChange={(e) => handleLayoutChange('background_color', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="seal_image_url">School Seal URL (Optional)</Label>
                  <Input
                    id="seal_image_url"
                    value={formData.layout_config.seal_image_url}
                    onChange={(e) => handleLayoutChange('seal_image_url', e.target.value)}
                    placeholder="https://example.com/school-seal.png"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {template ? 'Update Template' : 'Create Template'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div 
                className={`
                  w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg
                  ${formData.layout_config.border_style === 'classic' ? 'border-4 border-double border-gray-800' : ''}
                  ${formData.layout_config.border_style === 'modern' ? 'border-2 border-blue-500' : ''}
                  ${formData.layout_config.border_style === 'minimalist' ? 'border border-gray-300' : ''}
                  ${formData.layout_config.border_style === 'ornate' ? 'border-8 border-gold' : ''}
                `}
                style={{ 
                  backgroundColor: formData.layout_config.background_color,
                  fontFamily: formData.layout_config.font_family === 'serif' ? 'serif' : 
                              formData.layout_config.font_family === 'sans-serif' ? 'sans-serif' : 
                              'cursive'
                } as React.CSSProperties}
              >
                <div className="text-center space-y-4">
                  <h1 className="text-xl font-bold">{formData.title_text}</h1>
                  <div className="text-sm">
                    {formData.body_text.replace('{{student_name}}', 'John Doe').replace('{{reason}}', 'excellent performance')}
                  </div>
                  <div className="flex justify-between text-xs mt-8">
                    <div>{formData.signature_1_name}</div>
                    <div>{formData.signature_2_name}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateTemplateEditor;