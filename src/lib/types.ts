import { Database } from '@/../supabase/database.types';

export type Artifact = Database['public']['Tables']['artifacts']['Row'];

export type Character = Database['public']['Tables']['characters']['Row'];

export type CharacterArtifact =
  Database['public']['Tables']['character_artifacts']['Row'];

export type CharacterMetadata =
  Database['public']['Tables']['character_metadata']['Row'];

export type CharacterStats =
  Database['public']['Tables']['character_stats']['Row'];

export type CharacterSubstats =
  Database['public']['Tables']['character_substats']['Row'];
