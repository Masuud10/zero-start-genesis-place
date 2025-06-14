
import { supabase } from '@/integrations/supabase/client';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

// Core service for basic CRUD operations
export class DataServiceCore {
  static async createRecord<T>(
    table: string, 
    data: Partial<T>, 
    requiresSchoolScope: boolean = true
  ) {
    try {
      const scopedData = requiresSchoolScope 
        ? await MultiTenantUtils.ensureSchoolScope(data)
        : data;

      const { data: result, error } = await supabase
        .from(table)
        .insert(scopedData)
        .select()
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Error creating ${table} record:`, error);
      return { data: null, error };
    }
  }

  static async updateRecord<T>(
    table: string,
    id: string,
    updates: Partial<T>
  ) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating ${table} record:`, error);
      return { data: null, error };
    }
  }

  static async deleteRecord(table: string, id: string, softDelete: boolean = true) {
    try {
      if (softDelete) {
        const { error } = await supabase
          .from(table)
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      return { error };
    }
  }

  static async fetchRecords<T>(
    table: string,
    filters?: Record<string, any>,
    selectFields?: string
  ) {
    try {
      let query = supabase.from(table).select(selectFields || '*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as T[], error: null };
    } catch (error) {
      console.error(`Error fetching ${table} records:`, error);
      return { data: null, error };
    }
  }
}
