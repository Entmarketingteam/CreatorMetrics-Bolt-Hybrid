import { Post, PostMetrics } from '../../lib/schema';
import { parseCsv } from '../../lib/csv';
import { toNumber } from './util_numbers';

function toCurrency(value: any): number {
  if (value == null || value === '') return 0;
  const cleaned = String(value).replace(/[,$]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDate(value: any): string | null {
  if (!value) return null;
  const m = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let [, mm, dd, yy] = m;
  if (yy.length === 2) yy = '20' + yy;
  return `${yy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/**
 * LTK post-level export (ltkposts-card).
 */
export async function ingestLTKPosts(
  csvText: string,
  opts?: { creatorId?: string; campaignId?: string }
): Promise<{ posts: Post[]; metrics: PostMetrics[] }> {
  const rows = parseCsv(csvText);
  const creatorId = opts?.creatorId ?? 'creator_nicki';
  const campaignId = opts?.campaignId;

  const posts: Post[] = [];
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const shareUrl = row['share_url'];
    if (!shareUrl) continue;

    const id = `ltk_${shareUrl}`;
    const date = row['date_published'] || '2025-01-01';
    posts.push({
      id,
      platform: 'ltk',
      creatorId,
      campaignId,
      externalId: shareUrl,
      url: shareUrl,
      postedAt: date,
      title: '',
      thumbnailUrl: row['hero_image'] || '',
    });

    const clicks = toNumber(row['clicks']);
    const orders = toNumber(row['orders']);
    const itemsSold = toNumber(row['items_sold']);
    const commissions = toCurrency(row['commissions']);

    metrics.push({
      postId: id,
      platform: 'ltk',
      date,
      impressions: 0,
      clicks,
      detailPageViews: clicks,
      addToCarts: 0,
      conversions: orders || itemsSold,
      revenue: commissions,
    });
  }

  return { posts, metrics };
}

/**
 * LTK analytics export (product-level).
 */
export async function ingestLTKAnalytics(
  csvText: string,
  opts?: { creatorId?: string; campaignId?: string }
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseCsv(csvText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const url = row['url'];
    if (!url) continue;

    const id = `ltk_prod_${url}`;
    const clicks = toNumber(row['clicks']);
    const orders = toNumber(row['orders']);
    const itemsSold = toNumber(row['items_sold']);
    const commissions = toCurrency(row['commissions']);
    const date = '2025-01-01';

    metrics.push({
      postId: id,
      platform: 'ltk',
      date,
      impressions: 0,
      clicks,
      detailPageViews: clicks,
      addToCarts: 0,
      conversions: orders || itemsSold,
      revenue: commissions,
    });
  }

  return { metrics };
}

export async function ingestLTKBrands(csvText: string): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseCsv(csvText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const brand = row['advertiser_name'];
    if (!brand) continue;

    const id = `ltk_brand_${brand}`;
    const clicks = toNumber(row['clicks']);
    const orders = toNumber(row['orders']);
    const itemsSold = toNumber(row['items_sold']);
    const commissions = toCurrency(row['commissions']);
    const date = '2025-01-01';

    metrics.push({
      postId: id,
      platform: 'ltk',
      date,
      impressions: 0,
      clicks,
      detailPageViews: clicks,
      addToCarts: 0,
      conversions: orders || itemsSold,
      revenue: commissions,
    });
  }

  return { metrics };
}

export async function ingestLTKEarnings(csvText: string): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseCsv(csvText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const date = normalizeDate(row['Date']) || '2025-01-01';
    const brand = row['Brand'] || 'Unknown';
    const product = row['Product'] || '';
    const link = row['Direct to retailer link'] || '';
    const id = `ltk_earn_${brand}_${product || link}`;
    const commission = toCurrency(row['Commission']);

    metrics.push({
      postId: id,
      platform: 'ltk',
      date,
      impressions: 0,
      clicks: 0,
      detailPageViews: 0,
      addToCarts: 0,
      conversions: 1,
      revenue: commission,
    });
  }

  return { metrics };
}
