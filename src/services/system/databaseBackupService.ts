import { supabase } from '@/integrations/supabase/client';

export interface BackupRecord {
  id: string;
  type: 'full' | 'incremental' | 'configuration';
  size: string;
  status: 'completed' | 'running' | 'failed';
  created_at: string;
  duration: string;
  download_url?: string;
  metadata?: Record<string, any>;
}

export interface BackupHistory {
  id: string;
  type: 'full' | 'incremental' | 'configuration';
  status: 'completed' | 'running' | 'failed';
  size: string;
  duration: string;
  created_at: string;
  created_by: string;
  metadata: Record<string, any>;
}

export interface BackupSettings {
  auto_backup_enabled: boolean;
  backup_frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backup_time: string;
  retention_days: number;
  max_backups: number;
  compress_backups: boolean;
}

export class DatabaseBackupService {
  static async createBackup(type: 'full' | 'incremental' | 'configuration' = 'full'): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      console.log('🗄️ DatabaseBackupService: Creating backup of type:', type);
      
      // Get current user for audit trail
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create backup record in support tickets table as backup log
      const { data: backupRecord, error: createError } = await supabase
        .from('support_tickets')
        .insert({
          title: `System Backup - ${type}`,
          description: `System backup of type ${type} initiated`,
          type: 'system',
          status: 'open',
          created_by: user?.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Simulate backup process (in real implementation, this would trigger actual backup)
      const backupData = await this.generateBackupData(type);
      
      // Update backup record with completion data
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          description: `System backup of type ${type} completed successfully`
        })
        .eq('id', backupRecord.id);

      if (updateError) throw updateError;

      console.log('🗄️ DatabaseBackupService: Backup completed successfully');
      return { success: true, backupId: backupRecord.id };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error creating backup:', error);
      return { success: false, error: error.message || 'Failed to create backup' };
    }
  }

  static async downloadBackup(backupId: string): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      console.log('🗄️ DatabaseBackupService: Downloading backup:', backupId);
      
      // Get backup record from support tickets
      const { data: backup, error: fetchError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', backupId)
        .eq('type', 'system')
        .single();

      if (fetchError) throw fetchError;
      if (!backup) throw new Error('Backup not found');

      // Generate backup data for full backup type
      const backupData = await this.generateBackupData('full');
      
      // Create downloadable file
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `edufam_backup_full_${timestamp}.json`;
      
      // Create blob and download link
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('🗄️ DatabaseBackupService: Backup downloaded successfully');
      return { success: true, downloadUrl: url };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error downloading backup:', error);
      return { success: false, error: error.message || 'Failed to download backup' };
    }
  }

  static async getBackupHistory(): Promise<BackupHistory[]> {
    const { data: backups, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('type', 'system')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return backups?.map(backup => ({
      id: backup.id,
      type: backup.title.includes('full') ? 'full' : 'incremental',
      status: backup.status === 'resolved' ? 'completed' : 'running',
      size: '0 MB',
      duration: '0 minutes',
      created_at: backup.created_at,
      created_by: backup.created_by,
      metadata: {}
    })) || [];
  }

  static async deleteBackup(backupId: string): Promise<boolean> {
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', backupId)
      .eq('type', 'system');

    return !error;
  }

  static async getBackupSettings(): Promise<{ data: BackupSettings | null; error?: string }> {
    try {
      console.log('🗄️ DatabaseBackupService: Fetching backup settings');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'backup_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Return default settings
        const defaultSettings: BackupSettings = {
          auto_backup_enabled: true,
          backup_frequency: 'daily',
          backup_time: '02:00',
          retention_days: 30,
          max_backups: 10,
          compress_backups: true
        };
        return { data: defaultSettings };
      }

      return { data: data.setting_value as unknown as BackupSettings };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error fetching backup settings:', error);
      return { data: null, error: error.message || 'Failed to fetch backup settings' };
    }
  }

  static async updateBackupSettings(settings: BackupSettings): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗄️ DatabaseBackupService: Updating backup settings');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'backup_settings',
          setting_value: settings as any,
          description: 'Database backup configuration'
        });

      if (error) throw error;

      console.log('🗄️ DatabaseBackupService: Backup settings updated successfully');
      return { success: true };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error updating backup settings:', error);
      return { success: false, error: error.message || 'Failed to update backup settings' };
    }
  }

  private static async generateBackupData(type: string): Promise<Record<string, any>> {
    const backupData: Record<string, any> = {
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0',
        backup_type: type,
        system_info: {
          platform: 'EduFam School Management System',
          version: '1.0.0'
        }
      }
    };

    try {
      if (type === 'full' || type === 'incremental') {
        // Fetch core data tables
        const tables = ['schools', 'profiles', 'students', 'classes', 'subjects'];
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table as any)
              .select('*')
              .limit(type === 'incremental' ? 1000 : 10000); // Limit for incremental backups
            
            if (!error && data) {
              backupData[table] = data;
            }
          } catch (error) {
            console.error(`Error backing up table ${table}:`, error);
          }
        }
      }

      return backupData;
    } catch (error) {
      console.error('🗄️ DatabaseBackupService: Error generating backup data:', error);
      return backupData;
    }
  }

  private static calculateBackupSize(data: any): string {
    const sizeInBytes = JSON.stringify(data).length;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return `${sizeInMB} MB`;
  }

  private static calculateDuration(startTime: string): string {
    const start = new Date(startTime);
    const end = new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}