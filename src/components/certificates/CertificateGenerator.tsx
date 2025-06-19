
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Award, Download, FileText, Users } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';

const CertificateGenerator: React.FC = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerateCertificates = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select both class and term",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate certificate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Certificates Generated",
        description: `Certificates have been generated for ${selectedClass} - ${selectedTerm}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate certificates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade1a">Grade 1A</SelectItem>
                  <SelectItem value="grade1b">Grade 1B</SelectItem>
                  <SelectItem value="grade2a">Grade 2A</SelectItem>
                  <SelectItem value="grade2b">Grade 2B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateCertificates} 
            disabled={generating || !selectedClass || !selectedTerm}
            className="w-full"
          >
            {generating ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Generating Certificates...
              </>
            ) : (
              <>
                <Award className="h-4 w-4 mr-2" />
                Generate Certificates
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Grade 1A - Term 1 2024</p>
                <p className="text-sm text-muted-foreground">Generated on March 15, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">25 Students</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Grade 2B - Term 1 2024</p>
                <p className="text-sm text-muted-foreground">Generated on March 10, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">30 Students</Badge>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateGenerator;
