import { supabaseClient } from '@/lib/common';
import { AggregatedData } from '@/lib/types';

export default async function fetchStatistics(artifactID: number) {
  const { data: statisticsData, error: statisticsError } =
    await supabaseClient.rpc('fetch_statistics', {
      artifact_target: artifactID,
    });

  if (statisticsError) {
    throw statisticsError;
  }

  return statisticsData as Record<string, AggregatedData[]>;
}
