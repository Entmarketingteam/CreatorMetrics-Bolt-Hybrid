import { getCampaigns } from '../../lib/storage';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-neutral-400">
            Cross-platform performance grouped by brand and initiative.
          </p>
        </header>

        <div className="space-y-3 text-sm">
          {campaigns.map((c) => (
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
      </div>
    </main>
  );
}
