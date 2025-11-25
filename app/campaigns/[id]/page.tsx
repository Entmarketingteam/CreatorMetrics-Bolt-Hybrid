import {
  getCampaignById,
  getCreatorById,
  getMappings,
  getPosts,
  getPostMetrics,
} from '../../../lib/storage';
import { buildFunnelViews } from '../../../lib/matching';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({ params }: Params) {
  const [campaign, mappings, posts, metrics] = await Promise.all([
    getCampaignById(params.id),
    getMappings(),
    getPosts(),
    getPostMetrics(),
  ]);

  if (!campaign) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-400">Campaign not found.</p>
      </main>
    );
  }

  const creator = await getCreatorById(campaign.creatorId);
  const campaignMappings = mappings.filter((m) => m.campaignId === params.id);
  const funnels = buildFunnelViews(posts, metrics, campaignMappings);

  const totals = funnels.reduce(
    (acc, f) => {
      acc.revenue += f.funnel.revenue;
      acc.conversions += f.funnel.conversions;
      acc.clicks += f.funnel.clicks;
      return acc;
    },
    { revenue: 0, conversions: 0, clicks: 0 }
  );
  const cr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-neutral-500">
            <a href="/campaigns" className="hover:underline">
              ← Back to campaigns
            </a>
          </p>
          <h1 className="text-2xl font-semibold">{campaign.name}</h1>
          <p className="text-sm text-neutral-400">Brand: {campaign.brand}</p>
          {creator && (
            <p className="text-xs text-neutral-500">
              Creator:{' '}
              <a href={`/creators/${creator.id}`} className="underline">
                {creator.displayName} (@{creator.handle})
              </a>
            </p>
          )}
          <p className="text-xs text-neutral-500">
            {campaign.startDate} → {campaign.endDate || 'ongoing'}
          </p>
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm space-y-1">
          <p className="text-xs text-neutral-400">Mapped funnel totals</p>
          <p>Revenue: <span className="font-semibold">${totals.revenue.toLocaleString()}</span></p>
          <p>Conversions: <span className="font-semibold">{totals.conversions.toLocaleString()}</span></p>
          <p>Clicks: <span className="font-semibold">{totals.clicks.toLocaleString()}</span></p>
          <p>Click → Conversion: <span className="font-semibold">{cr.toFixed(1)}%</span></p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-neutral-200">Funnel mappings</h2>
          {funnels.length === 0 && (
            <p className="text-xs text-neutral-500">
              No mappings yet. Once data is ingested, individual funnel mappings will appear here.
            </p>
          )}
          <div className="space-y-3 text-xs">
            {funnels.map((f) => (
              <div
                key={f.mappingId}
                className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 space-y-1"
              >
                <p className="text-neutral-400">
                  Mapping ID: <span className="font-mono">{f.mappingId}</span>
                </p>
                <p>Impressions: {f.funnel.impressions.toLocaleString()}</p>
                <p>Clicks: {f.funnel.clicks.toLocaleString()}</p>
                <p>DPVs: {f.funnel.detailPageViews.toLocaleString()}</p>
                <p>ATC: {f.funnel.addToCarts.toLocaleString()}</p>
                <p>Conversions: {f.funnel.conversions.toLocaleString()}</p>
                <p>Revenue: ${f.funnel.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
