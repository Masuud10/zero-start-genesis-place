import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface SystemConfig {
  school_year_start: string;
  school_year_end: string;
  default_curriculum: string;
  default_grading_scale: string;
  timezone: string;
  date_format: string;
  term_structure: string;
}

const SystemConfigSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<SystemConfig>({
    school_year_start: '',
    school_year_end: '',
    default_curriculum: 'CBC',
    default_grading_scale: 'CBC',
    timezone: 'Africa/Nairobi',
    date_format: 'DD/MM/YYYY',
    term_structure: '3-term'
  });

  // Fetch current system configuration
  const { data: systemConfig, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'global_config')
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value || {};
    }
  });

  useEffect(() => {
    if (systemConfig && typeof systemConfig === 'object' && systemConfig !== null) {
      const data = systemConfig as Partial<SystemConfig>;
      setConfig(prev => ({ ...prev, ...data }));
    }
  }, [systemConfig]);

  const updateSystemConfig = useMutation({
    mutationFn: async (newConfig: SystemConfig) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'global_config',
          setting_value: newConfig as any,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return newConfig;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update system configuration",
        variant: "destructive"
      });
    }
  });

  const handleConfigChange = (key: keyof SystemConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = () => {
    // Validate dates
    if (config.school_year_start && config.school_year_end) {
      if (new Date(config.school_year_start) >= new Date(config.school_year_end)) {
        toast({
          title: "Validation Error",
          description: "School year start date must be before end date",
          variant: "destructive"
        });
        return;
      }
    }

    updateSystemConfig.mutate(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Academic Year Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Academic Year Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school-year-start">School Year Start Date</Label>
              <Input
                id="school-year-start"
                type="date"
                value={config.school_year_start}
                onChange={(e) => handleConfigChange('school_year_start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-year-end">School Year End Date</Label>
              <Input
                id="school-year-end"
                type="date"
                value={config.school_year_end}
                onChange={(e) => handleConfigChange('school_year_end', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Term Structure</Label>
            <Select 
              value={config.term_structure} 
              onValueChange={(value) => handleConfigChange('term_structure', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-term">3 Terms</SelectItem>
                <SelectItem value="2-semester">2 Semesters</SelectItem>
                <SelectItem value="4-quarter">4 Quarters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Curriculum & Grading */}
        <div className="space-y-4">
          <h4 className="font-medium">Curriculum & Grading</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Curriculum</Label>
              <Select 
                value={config.default_curriculum} 
                onValueChange={(value) => handleConfigChange('default_curriculum', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBC">CBC (Competency Based Curriculum)</SelectItem>
                  <SelectItem value="IGCSE">IGCSE</SelectItem>
                  <SelectItem value="Standard">Standard Curriculum</SelectItem>
                  <SelectItem value="IB">International Baccalaureate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Grading Scale</Label>
              <Select 
                value={config.default_grading_scale} 
                onValueChange={(value) => handleConfigChange('default_grading_scale', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBC">CBC (Exceeding/Meeting/Approaching/Below)</SelectItem>
                  <SelectItem value="IGCSE">IGCSE (A*-U)</SelectItem>
                  <SelectItem value="Standard">Standard (A-F)</SelectItem>
                  <SelectItem value="Percentage">Percentage (0-100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Localization */}
        <div className="space-y-4">
          <h4 className="font-medium">Localization</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select 
                value={config.timezone} 
                onValueChange={(value) => handleConfigChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  <SelectItem value="Africa/Cairo">Africa/Cairo (EET)</SelectItem>
                  <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={config.date_format} 
                onValueChange={(value) => handleConfigChange('date_format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Alert className="flex-1 mr-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              These settings will apply globally across the entire platform and affect all schools.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleSaveConfig}
            disabled={updateSystemConfig.isPending || isLoading}
            className="flex items-center gap-2 min-w-[140px]"
          >
            <Save className="w-4 h-4" />
            {updateSystemConfig.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemConfigSection;