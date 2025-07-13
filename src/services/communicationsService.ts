import { supabase } from '@/integrations/supabase/client';
import { 
  AdminCommunication, 
  AdminCommunicationCreate, 
  AdminCommunicationUpdate,
  UserDismissedCommunication 
} from '@/types/communications';

export class CommunicationsService {
  // Get communications for a specific user role
  static async getUserCommunications(userRole: string, userId: string): Promise<AdminCommunication[]> {
    try {
      console.log('📢 CommunicationsService: Fetching communications for role:', userRole);
      
      const now = new Date().toISOString();
      
      // Get communications that target this user's role and are active
      const { data: communications, error } = await supabase
        .from('admin_communications')
        .select('*')
        .eq('is_active', true)
        .contains('target_roles', [userRole])
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('📢 CommunicationsService: Error fetching communications:', error);
        throw error;
      }

      // Filter out communications that the user has dismissed
      const { data: dismissedCommunications, error: dismissedError } = await supabase
        .from('user_dismissed_communications')
        .select('communication_id')
        .eq('user_id', userId);

      if (dismissedError) {
        console.error('📢 CommunicationsService: Error fetching dismissed communications:', dismissedError);
        throw dismissedError;
      }

      const dismissedIds = dismissedCommunications?.map(d => d.communication_id) || [];
      const filteredCommunications = communications?.filter(comm => !dismissedIds.includes(comm.id)) || [];

      console.log('📢 CommunicationsService: Returning communications:', filteredCommunications.length);
      return filteredCommunications as AdminCommunication[];
    } catch (error) {
      console.error('📢 CommunicationsService: Error in getUserCommunications:', error);
      return [];
    }
  }

  // Get all communications (for admin management)
  static async getAllCommunications(): Promise<AdminCommunication[]> {
    try {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('📢 CommunicationsService: Error fetching all communications:', error);
        throw error;
      }

      return (data || []) as AdminCommunication[];
    } catch (error) {
      console.error('📢 CommunicationsService: Error in getAllCommunications:', error);
      return [];
    }
  }

  // Create a new communication
  static async createCommunication(communication: AdminCommunicationCreate): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('admin_communications')
        .insert({
          ...communication,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('📢 CommunicationsService: Error creating communication:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('📢 CommunicationsService: Error in createCommunication:', error);
      return { success: false, error: 'Failed to create communication' };
    }
  }

  // Update a communication
  static async updateCommunication(id: string, updates: AdminCommunicationUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_communications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('📢 CommunicationsService: Error updating communication:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('📢 CommunicationsService: Error in updateCommunication:', error);
      return { success: false, error: 'Failed to update communication' };
    }
  }

  // Delete a communication
  static async deleteCommunication(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_communications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('📢 CommunicationsService: Error deleting communication:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('📢 CommunicationsService: Error in deleteCommunication:', error);
      return { success: false, error: 'Failed to delete communication' };
    }
  }

  // Dismiss a communication for a user
  static async dismissCommunication(communicationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_dismissed_communications')
        .insert({
          user_id: userId,
          communication_id: communicationId,
          dismissed_at: new Date().toISOString()
        });

      if (error) {
        console.error('📢 CommunicationsService: Error dismissing communication:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('📢 CommunicationsService: Error in dismissCommunication:', error);
      return { success: false, error: 'Failed to dismiss communication' };
    }
  }

  // Get communication statistics
  static async getCommunicationStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byPriority: { low: number; medium: number; high: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('*');

      if (error) {
        console.error('📢 CommunicationsService: Error fetching communication stats:', error);
        throw error;
      }

      const now = new Date().toISOString();
      const total = data?.length || 0;
      const active = data?.filter(comm => comm.is_active && (!comm.expires_at || comm.expires_at > now)).length || 0;
      const expired = data?.filter(comm => comm.expires_at && comm.expires_at <= now).length || 0;
      
      const byPriority = {
        low: data?.filter(comm => comm.priority === 'low').length || 0,
        medium: data?.filter(comm => comm.priority === 'medium').length || 0,
        high: data?.filter(comm => comm.priority === 'high').length || 0
      };

      return { total, active, expired, byPriority };
    } catch (error) {
      console.error('📢 CommunicationsService: Error in getCommunicationStats:', error);
      return { total: 0, active: 0, expired: 0, byPriority: { low: 0, medium: 0, high: 0 } };
    }
  }
} 