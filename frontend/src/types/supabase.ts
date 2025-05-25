
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type with our new tables
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      profiles: OriginalDatabase['public']['Tables']['profiles'];
      objectives: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          title: string;
          status: string;
          progress: number;
          assignee: string | null;
          objective_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          status: string;
          progress?: number;
          assignee?: string | null;
          objective_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          status?: string;
          progress?: number;
          assignee?: string | null;
          objective_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_objective_id_fkey";
            columns: ["objective_id"];
            isOneToOne: false;
            referencedRelation: "objectives";
            referencedColumns: ["id"];
          }
        ];
      };
      objectives_history: {
        Row: {
          id: string;
          objective_id: string;
          progress: number | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          objective_id: string;
          progress?: number | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          objective_id?: string;
          progress?: number | null;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "objectives_history_objective_id_fkey";
            columns: ["objective_id"];
            isOneToOne: false;
            referencedRelation: "objectives";
            referencedColumns: ["id"];
          }
        ];
      };
      status_configurations: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_active: boolean | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_active?: boolean | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_active?: boolean | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      period_configurations: {
        Row: {
          id: string;
          name: string;
          duration_days: number;
          is_active: boolean | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_days: number;
          is_active?: boolean | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          duration_days?: number;
          is_active?: boolean | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Create a client using our extended Database type
export type ExtendedClient = ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;
