import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      inspections: {
        Row: {
          id: string;
          timestamp: string;
          camera_id: string;
          image_url: string;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inspections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['inspections']['Insert']>;
      };
      detections: {
        Row: {
          id: string;
          inspection_id: string;
          bbox_x1: number;
          bbox_y1: number;
          bbox_x2: number;
          bbox_y2: number;
          crop_url: string;
          ocr_text: string;
          ocr_confidence: number;
          match_score: number;
          verdict: string;
          datasheet_id: string | null;
          datasheet_excerpt: string | null;
          override_by: string | null;
          override_verdict: string | null;
          override_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['detections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['detections']['Insert']>;
      };
      datasheets: {
        Row: {
          id: string;
          vendor: string;
          part_number: string;
          datasheet_url: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['datasheets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['datasheets']['Insert']>;
      };
      system_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['system_settings']['Insert']>;
      };
    };
  };
}
