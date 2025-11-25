import { Post, PostMetrics } from '../../lib/schema';
import { parseCsv } from '../../lib/csv';
import { toNumber } from './util_numbers';

/**
 * Ingest Instagram Business Suite-style CSV.
 */
export async function ingestInstagramBusinessSuite(
  csvText: string,
  opts?: { creatorId?: string; campaignId?: string }
): Promise<{ posts: Post[]; metrics: PostMetrics[] }> {
  const rows = parseCsv(csvText);
  const creatorId = opts?.creatorId ?? 'creator_nicki';
  const campaignId = opts?.campaignId;

  const posts: Post[] = [];
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const postIdRaw = row['Post ID'];
    if (!postIdRaw) continue;

    const id = `ig_${postIdRaw}`;
    const date =
      row['Date'] ||
      (row['Publish time'] ? String(row['Publish time']).split('T')[0] : '2025-01-01');

    posts.push({
      id,
      platform: 'instagram',
      creatorId,
      campaignId,
      externalId: postIdRaw,
      url: row['Permalink'] || '',
      postedAt: row['Publish time'] || '',
      title: row['Description'] || '',
      thumbnailUrl: '',
    });

    const views = toNumber(row['Views']);
    const reach = toNumber(row['Reach']);
    const linkClicks = toNumber(row['Link clicks']);
    const profileVisits = toNumber(row['Profile visits']);

    const clicks = linkClicks || profileVisits;

    metrics.push({
      postId: id,
      platform: 'instagram',
      date,
      impressions: views || reach,
      clicks,
      detailPageViews: 0,
      addToCarts: 0,
      conversions: 0,
      revenue: 0,
    });
  }

  return { posts, metrics };
}
