import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type for valid table names
type TableName = keyof Database['public']['Tables'];

// Core service for basic CRUD operations
export class DataServiceCore {
  static async createRecord<T>(
    table: TableName, 
    data: Partial<T>
  ) {
    try {
      // The client-side school scope enforcement has been removed.
      // This logic is now handled by the caller preparing the data
      // and is securely enforced by database-level RLS policies.
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Error creating ${table} record:`, error);
      return { data: null, error };
    }
  }

  static async upsertRecord<T>(
    table: TableName,
    data: Partial<T>,
    options?: { onConflict?: string }
  ) {
    try {
      const query = supabase
        .from(table as any)
        .upsert(data as any, {
          onConflict: options?.onConflict,
          ignoreDuplicates: false
        })
        .select()
        .single();

      const { data: result, error } = await query;

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Error upserting ${table} record:`, error);
      return { data: null, error };
    }
  }

  static async updateRecord<T>(
    table: TableName,
    id: string,
    updates: Partial<T>
  ) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
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

  static async deleteRecord(table: TableName, id: string, softDelete: boolean = true) {
    try {
      if (softDelete) {
        const { error } = await supabase
          .from(table as any)
          .update({ is_active: false, updated_at: new Date().toISOString() } as any)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table as any)
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
    table: TableName,
    filters?: Record<string, any>,
    selectFields?: string
  ) {
    try {
      let query = supabase.from(table as any).select(selectFields || '*');
      
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
