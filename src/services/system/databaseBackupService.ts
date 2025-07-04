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
      
      // Create backup record
      const { data: backupRecord, error: createError } = await supabase
        .from('system_backups')
        .insert({
          type,
          status: 'running',
          created_by: user?.id,
          metadata: {
            backup_type: type,
            started_at: new Date().toISOString(),
            tables_included: type === 'full' ? 'all' : type === 'incremental' ? 'modified_only' : 'configuration_only'
          }
        })
        .select()
        .single();

      if (createError) throw createError;

      // Simulate backup process (in real implementation, this would trigger actual backup)
      const backupData = await this.generateBackupData(type);
      
      // Update backup record with completion data
      const { error: updateError } = await supabase
        .from('system_backups')
        .update({
          status: 'completed',
          size: this.calculateBackupSize(backupData),
          duration: this.calculateDuration(backupRecord.created_at),
          metadata: {
            ...backupRecord.metadata,
            completed_at: new Date().toISOString(),
            record_count: Object.keys(backupData).length,
            backup_size_bytes: JSON.stringify(backupData).length
          }
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
      
      // Get backup record
      const { data: backup, error: fetchError } = await supabase
        .from('system_backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError) throw fetchError;
      if (!backup) throw new Error('Backup not found');

      // Generate backup data
      const backupData = await this.generateBackupData(backup.type);
      
      // Create downloadable file
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `edufam_backup_${backup.type}_${timestamp}.json`;
      
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

      // Log download action
      await supabase
        .from('system_backups')
        .update({
          metadata: {
            ...backup.metadata,
            downloaded_at: new Date().toISOString(),
            downloaded_by: (await supabase.auth.getUser()).data.user?.id
          }
        })
        .eq('id', backupId);

      console.log('🗄️ DatabaseBackupService: Backup downloaded successfully');
      return { success: true, downloadUrl: url };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error downloading backup:', error);
      return { success: false, error: error.message || 'Failed to download backup' };
    }
  }

  static async getBackupHistory(): Promise<{ data: BackupRecord[]; error?: string }> {
    try {
      console.log('🗄️ DatabaseBackupService: Fetching backup history');
      
      const { data, error } = await supabase
        .from('system_backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const backupRecords: BackupRecord[] = (data || []).map(record => ({
        id: record.id,
        type: record.type,
        size: record.size || 'Unknown',
        status: record.status,
        created_at: record.created_at,
        duration: record.duration || 'Unknown',
        metadata: record.metadata
      }));

      console.log('🗄️ DatabaseBackupService: Backup history fetched:', backupRecords.length, 'records');
      return { data: backupRecords };
    } catch (error: any) {
      console.error('🗄️ DatabaseBackupService: Error fetching backup history:', error);
      return { data: [], error: error.message || 'Failed to fetch backup history' };
    }
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

      return { data: data.setting_value as BackupSettings };
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
          setting_value: settings,
          description: 'Database backup configuration',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'setting_key'
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
        const tables = ['schools', 'profiles', 'students', 'classes', 'subjects', 'grades', 'financial_transactions'];
        
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(type === 'incremental' ? 1000 : 10000); // Limit for incremental backups
          
          if (!error && data) {
            backupData[table] = data;
          }
        }
      }

      if (type === 'configuration' || type === 'full') {
        // Fetch system settings
        const { data: settings, error: settingsError } = await supabase
          .from('system_settings')
          .select('*');
        
        if (!settingsError && settings) {
          backupData.system_settings = settings;
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