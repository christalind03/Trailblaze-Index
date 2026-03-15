export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      fetch_statistics: { Args: { artifact_target: number }; Returns: Json };
    };
    Tables: {
      artifacts: {
        Insert: {
          id?: number;
          name: string;
          type: string;
        };
        Relationships: [];
        Row: {
          id: number;
          name: string;
          type: string;
        };
        Update: {
          id?: number;
          name?: string;
          type?: string;
        };
      };
      character_artifacts: {
        Insert: {
          artifact_id: number;
          character_id: number;
          has_priority: boolean;
          id?: string;
          type: string;
        };
        Relationships: [
          {
            columns: ['artifact_id'];
            foreignKeyName: 'character_artifacts_artifact_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'artifacts';
          },
          {
            columns: ['character_id'];
            foreignKeyName: 'character_artifacts_character_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'characters';
          },
        ];
        Row: {
          artifact_id: number;
          character_id: number;
          has_priority: boolean;
          id: string;
          type: string;
        };
        Update: {
          artifact_id?: number;
          character_id?: number;
          has_priority?: boolean;
          id?: string;
          type?: string;
        };
      };
      character_metadata: {
        Insert: {
          character_id: number;
          fetched_at: string;
          id?: string;
          source: string;
        };
        Relationships: [
          {
            columns: ['character_id'];
            foreignKeyName: 'character_metadata_character_id_fkey';
            isOneToOne: true;
            referencedColumns: ['id'];
            referencedRelation: 'characters';
          },
        ];
        Row: {
          character_id: number;
          fetched_at: string;
          id: string;
          source: string;
        };
        Update: {
          character_id?: number;
          fetched_at?: string;
          id?: string;
          source?: string;
        };
      };
      character_stats: {
        Insert: {
          character_id: number;
          id?: string;
          label: string;
          priority: number;
          slot: string;
        };
        Relationships: [
          {
            columns: ['character_id'];
            foreignKeyName: 'character_stats_character_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'characters';
          },
        ];
        Row: {
          character_id: number;
          id: string;
          label: string;
          priority: number;
          slot: string;
        };
        Update: {
          character_id?: number;
          id?: string;
          label?: string;
          priority?: number;
          slot?: string;
        };
      };
      character_substats: {
        Insert: {
          character_id: number;
          condition?: null | string;
          group: number;
          id?: string;
          label: string;
          priority: number;
        };
        Relationships: [
          {
            columns: ['character_id'];
            foreignKeyName: 'character_substats_character_id_fkey';
            isOneToOne: false;
            referencedColumns: ['id'];
            referencedRelation: 'characters';
          },
        ];
        Row: {
          character_id: number;
          condition: null | string;
          group: number;
          id: string;
          label: string;
          priority: number;
        };
        Update: {
          character_id?: number;
          condition?: null | string;
          group?: number;
          id?: string;
          label?: string;
          priority?: number;
        };
      };
      characters: {
        Insert: {
          element: string;
          id?: number;
          name: string;
          path: string;
          quality: string;
        };
        Relationships: [];
        Row: {
          element: string;
          id: number;
          name: string;
          path: string;
          quality: string;
        };
        Update: {
          element?: string;
          id?: number;
          name?: string;
          path?: string;
          quality?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
};

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
