


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."fetch_statistics"("artifact_target" bigint) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  artifact_type TEXT;
  result JSON;
BEGIN
  -- Look up the artifact type before the main query so we can use it for filtering
  SELECT type INTO artifact_type
  FROM public.artifacts
  WHERE id = artifact_target;

  WITH

  -- Fetch all the characters that are able to use this artifact set
  artifact_users AS (
    SELECT DISTINCT character_id
    FROM public.character_artifacts
    WHERE artifact_id = artifact_target
  ),

  -- Fetch each character's preferred main stat for each artifact slot
  main_stats AS (
    SELECT
      character_stats.character_id,
      character_stats.slot,
      character_stats.label AS main_stat
    FROM public.character_stats
    JOIN artifact_users ON artifact_users.character_id = character_stats.character_id
    WHERE character_stats.slot = ANY(
      CASE artifact_type
        WHEN 'Cavern Relic' THEN ARRAY['Body', 'Feet']
        WHEN 'Planar Ornament' THEN ARRAY['Link Rope', 'Planar Sphere']
      END
    )
  ),

  -- For each character and their substat group, collect all the substat labels into a sorted array
  -- This array ensures that in the case there are multiple substat lists in different orders, they are treated as the same combination in later grouping steps
  substat_groups AS (
    SELECT
      character_substats.character_id,
      character_substats.group,
      ARRAY(
        SELECT label
        FROM public.character_substats as substat_entry
        WHERE substat_entry.character_id = character_substats.character_id
        AND substat_entry.group = character_substats.group
        ORDER BY label
      ) AS sorted_substats
    FROM public.character_substats
    JOIN artifact_users ON artifact_users.character_id = character_substats.character_id
    GROUP BY character_substats.character_id, character_substats.group
  ),

  -- Join the main stat and substats to produce a single row
  stat_combinations AS (
    SELECT
      main_stats.character_id,
      main_stats.slot,
      main_stats.main_stat,
      substat_groups.group,
      substat_groups.sorted_substats
    FROM main_stats
    JOIN substat_groups ON substat_groups.character_id = main_stats.character_id
  ),

  -- Collect the characters into a single column
  stat_combinations_collected AS (
    SELECT
      slot,
      main_stat,
      sorted_substats AS substats,
      array_agg(DISTINCT character_id ORDER BY character_id) AS characters
    FROM stat_combinations
    GROUP BY slot, main_stat, sorted_substats
  ),

  -- Additionally, if the artifact is of type 'Cavern Relic' additionally create collected stat combinations for 'Head' and 'Hands' slots
  static_combinations_collected AS (
    SELECT
      static_slots.slot,
      static_slots.main_stat,
      substat_groups.sorted_substats as substats,
      array_agg(DISTINCT substat_groups.character_id ORDER BY substat_groups.character_id) AS characters
    FROM (
      VALUES ('Head', 'HP'), ('Hands', 'ATK')
    ) AS static_slots(slot, main_stat)
    CROSS JOIN substat_groups
    GROUP BY static_slots.slot, static_slots.main_stat, substat_groups.sorted_substats
  ),

  -- Reshape into a single JSON array for each artifact slot
  slot_entries AS (
    SELECT
      slot,
      json_agg(
        json_build_object(
          'stat', main_stat,
          'substats', substats,
          'characters', characters
        )
        ORDER BY main_stat
      ) as entries
    FROM stat_combinations_collected
    GROUP BY slot
  ),

  -- Reshape static slots into the same JSON shape as slot_entries
  static_entries AS (
    SELECT
      slot,
      json_agg(
        json_build_object(
          'stat', main_stat,
          'substats', substats,
          'characters', characters
        )
      ) AS entries
    FROM static_combinations_collected
    -- Include these static entries only for artifacts of type 'Cavern Relic'
    WHERE artifact_type = 'Cavern Relic'
    GROUP BY slot
  ),

  all_entries AS (
    SELECT slot, entries FROM static_entries
    UNION ALL
    SELECT slot, entries FROM slot_entries
  )

  SELECT json_object_agg(slot, entries)
  INTO result
  FROM all_entries;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."fetch_statistics"("artifact_target" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."artifacts" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."artifacts" OWNER TO "postgres";


ALTER TABLE "public"."artifacts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."artifacts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."character_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artifact_id" bigint NOT NULL,
    "character_id" bigint NOT NULL,
    "has_priority" boolean NOT NULL,
    "type" "text" NOT NULL
);


ALTER TABLE "public"."character_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."character_metadata" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" bigint NOT NULL,
    "fetched_at" timestamp with time zone NOT NULL,
    "source" "text" NOT NULL
);


ALTER TABLE "public"."character_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."character_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" bigint NOT NULL,
    "slot" "text" NOT NULL,
    "label" "text" NOT NULL,
    "priority" numeric NOT NULL
);


ALTER TABLE "public"."character_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."character_substats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" bigint NOT NULL,
    "group" numeric NOT NULL,
    "label" "text" NOT NULL,
    "condition" "text" DEFAULT ''::"text",
    "priority" numeric NOT NULL
);


ALTER TABLE "public"."character_substats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."characters" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "path" "text" NOT NULL,
    "element" "text" NOT NULL,
    "quality" "text" NOT NULL
);


ALTER TABLE "public"."characters" OWNER TO "postgres";


ALTER TABLE "public"."characters" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."characters_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."character_artifacts"
    ADD CONSTRAINT "character_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."character_metadata"
    ADD CONSTRAINT "character_metadata_character_id_key" UNIQUE ("character_id");



ALTER TABLE ONLY "public"."character_metadata"
    ADD CONSTRAINT "character_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."character_stats"
    ADD CONSTRAINT "character_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."character_substats"
    ADD CONSTRAINT "character_substats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."characters"
    ADD CONSTRAINT "characters_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."characters"
    ADD CONSTRAINT "characters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."character_artifacts"
    ADD CONSTRAINT "character_artifacts_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."character_artifacts"
    ADD CONSTRAINT "character_artifacts_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."character_metadata"
    ADD CONSTRAINT "character_metadata_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."character_stats"
    ADD CONSTRAINT "character_stats_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."character_substats"
    ADD CONSTRAINT "character_substats_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable SELECT for all users" ON "public"."artifacts" FOR SELECT USING (true);



CREATE POLICY "Enable SELECT for all users" ON "public"."character_artifacts" FOR SELECT USING (true);



CREATE POLICY "Enable SELECT for all users" ON "public"."character_metadata" FOR SELECT USING (true);



CREATE POLICY "Enable SELECT for all users" ON "public"."character_stats" FOR SELECT USING (true);



CREATE POLICY "Enable SELECT for all users" ON "public"."character_substats" FOR SELECT USING (true);



CREATE POLICY "Enable SELECT for all users" ON "public"."characters" FOR SELECT USING (true);



ALTER TABLE "public"."artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."character_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."character_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."character_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."character_substats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."characters" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."fetch_statistics"("artifact_target" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_statistics"("artifact_target" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_statistics"("artifact_target" bigint) TO "service_role";
























GRANT ALL ON TABLE "public"."artifacts" TO "anon";
GRANT ALL ON TABLE "public"."artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."artifacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."artifacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."artifacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."artifacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."character_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."character_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."character_artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."character_metadata" TO "anon";
GRANT ALL ON TABLE "public"."character_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."character_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."character_stats" TO "anon";
GRANT ALL ON TABLE "public"."character_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."character_stats" TO "service_role";



GRANT ALL ON TABLE "public"."character_substats" TO "anon";
GRANT ALL ON TABLE "public"."character_substats" TO "authenticated";
GRANT ALL ON TABLE "public"."character_substats" TO "service_role";



GRANT ALL ON TABLE "public"."characters" TO "anon";
GRANT ALL ON TABLE "public"."characters" TO "authenticated";
GRANT ALL ON TABLE "public"."characters" TO "service_role";



GRANT ALL ON SEQUENCE "public"."characters_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."characters_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."characters_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































