CREATE OR REPLACE FUNCTION public.fetch_statistics(artifact_target BIGINT)
RETURNS json
LANGUAGE plpgsql
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