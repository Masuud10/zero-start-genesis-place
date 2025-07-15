import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CertificateTemplateEditor from './CertificateTemplateEditor';
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

const CertificateTemplateManager = () => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('certificate-templates', {
        method: 'GET'
      });

      if (error) throw error;

      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certificate templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase.functions.invoke('certificate-templates', {
        method: 'DELETE',
        body: { template_id: templateId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully"
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const handlePreview = (template: CertificateTemplate) => {
    setPreviewTemplate(template);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const method = editingTemplate ? 'PATCH' : 'POST';
      const url = editingTemplate 
        ? `certificate-templates/${editingTemplate.id}` 
        : 'certificate-templates';

      const { error } = await supabase.functions.invoke(url, {
        method,
        body: templateData
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: editingTemplate ? "Template updated successfully" : "Template created successfully"
      });

      setShowEditor(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <CertificateTemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  if (previewTemplate) {
    return (
      <CertificatePreview
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificate Templates</h2>
          <p className="text-muted-foreground">
            Create and manage customizable certificate templates for your school
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              No certificate templates found
            </div>
            <Button onClick={handleCreateNew}>
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <Badge variant="secondary">{template.template_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Title:</strong> {template.title_text}</div>
                    <div className="mt-1 line-clamp-2">
                      <strong>Body:</strong> {template.body_text}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(template)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(template)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                      className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateTemplateManager;