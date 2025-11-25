export async function runNinaAgent(input: string, _context: any = {}) {
  const lower = input.toLowerCase();

  if (lower.includes('clean')) {
    return `🧹 Nina: Cleaning Plan

1. Normalize column names (creator, campaign, media_id, tracking_id, revenue, etc.)
2. Standardize timestamps to ISO 8601.
3. Deduplicate rows by (date, post, platform).
4. Validate numeric fields (clicks, DPVs, ATCs, conversions, revenue).
5. Flag outliers for manual review.`;
  }

  if (lower.includes('map') || lower.includes('funnel')) {
    return `🔗 Nina: Mapping IG → LTK → Amazon

1. Start from Instagram media_id and permalink.
2. Match to LTK posts using caption keywords, shared product links, and timestamps.
3. Link Amazon exports via tracking_id patterns (e.g. nicki-igreel-20, nicki-metads-20).
4. Build LinkMapping entities that connect instagram_post_id, ltk_post_id, amazon_tracking_id.
5. Aggregate metrics across the mapping to create a single funnel view.`;
  }

  return `Nina here — ask how to "clean" exports or how to "map IG to LTK to Amazon".`;
}
