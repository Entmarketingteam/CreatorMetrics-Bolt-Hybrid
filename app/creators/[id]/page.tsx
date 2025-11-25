import {
  getCreatorById,
  getCampaigns,
  getMappings,
  getPosts,
  getPostMetrics,
} from '../../../lib/storage';
import { buildFunnelViews } from '../../../lib/matching';
import PostList from '../../../components/PostList';

interface Params {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function CreatorDetailPage({ params }: Params) {
  const [creator, campaigns, mappings, posts, metrics] = await Promise.all([
    getCreatorById(params.id),
    getCampaigns(),
    getMappings(),
    getPosts(),
    getPostMetrics(),
  ]);

  if (!creator) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-400">Creator not found.</p>
      </main>
    );
  }

  const creatorCampaigns = campaigns.filter((c) => c.creatorId === params.id);
  const creatorMappings = mappings.filter((m) => m.creatorId === params.id);
  const funnels = buildFunnelViews(posts, metrics, creatorMappings);
  const creatorPosts = posts.filter((p) => p.creatorId === params.id);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-neutral-500">
            <a href="/creators" className="hover:underline">
              ← Back to creators
            </a>
          </p>
          <h1 className="text-2xl font-semibold">{creator.displayName}</h1>
          <p className="text-sm text-neutral-400">@{creator.handle}</p>
          <p className="text-xs text-neutral-500">
            Platforms: {creator.platforms.join(', ')}
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-neutral-200">Funnel Views</h2>
          {funnels.length === 0 && (
            <p className="text-xs text-neutral-500">
              No funnel data yet. Ingest LTK / Amazon / Instagram exports to see a full funnel.
            </p>
          )}
          <div className="space-y-3">
            {funnels.map((f) => (
              <div
                key={f.mappingId}
                className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 space-y-2 text-xs"
              >
                <p className="text-neutral-400">
                  Mapping ID: <span className="font-mono">{f.mappingId}</span>
                </p>
                <FunnelRow label="Impressions" value={f.funnel.impressions} max={f.funnel.impressions} />
                <FunnelRow label="Clicks" value={f.funnel.clicks} max={f.funnel.impressions} />
                <FunnelRow label="DPVs" value={f.funnel.detailPageViews} max={f.funnel.impressions} />
                <FunnelRow label="ATC" value={f.funnel.addToCarts} max={f.funnel.impressions} />
                <FunnelRow label="Conversions" value={f.funnel.conversions} max={f.funnel.impressions} />
                <p className="text-neutral-400">
                  Revenue: <span className="font-semibold">${f.funnel.revenue.toLocaleString()}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-neutral-200">Campaigns</h2>
          <div className="space-y-2 text-sm">
            {creatorCampaigns.length === 0 && (
              <p className="text-xs text-neutral-500">No campaigns yet.</p>
            )}
            {creatorCampaigns.map((c) => (
              <a
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 hover:border-neutral-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-neutral-500">Brand: {c.brand}</p>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {c.startDate} → {c.endDate || 'ongoing'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-neutral-200">Posts</h2>
          <PostList posts={creatorPosts} />
        </section>
      </div>
    </main>
  );
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-neutral-300">{label}</span>
        <span className="font-mono text-neutral-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
