import { getDashboardSummary } from '../../functions/dashboard/summary';
import { getCurrentUser } from '../../lib/auth';
import MetricSpark from '../../components/MetricSpark';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-300">Sign in required</p>
          <p className="text-xs text-neutral-500">
            Connect Supabase or Clerk auth to unlock the CreatorMetrics dashboard.
          </p>
        </div>
      </main>
    );
  }

  const summary = await getDashboardSummary();

  const funnel = [
    { label: 'Impressions', value: summary.impressions },
    { label: 'Clicks', value: summary.clicks },
    { label: 'DPVs', value: summary.detailPageViews },
    { label: 'ATC', value: summary.addToCarts },
    { label: 'Conversions', value: summary.conversions },
  ];
  const maxFunnel = Math.max(...funnel.map((f) => f.value || 1));

  const revenueSeries = [
    { label: 'W1', value: Math.round(summary.revenue / 10) },
    { label: 'W2', value: Math.round(summary.revenue / 8) },
    { label: 'W3', value: Math.round(summary.revenue / 5) },
    { label: 'W4', value: summary.revenue },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-6xl mx-auto px-4 md:px-0 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              CreatorMetrics Dashboard
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              Full-funnel view of your creator performance across Instagram, LTK, and Amazon.
            </p>
          </div>
          <div className="text-xs text-neutral-500 text-right">
            Time range<br />
            <span className="font-mono text-neutral-300">
              {summary.timeRange.start} → {summary.timeRange.end}
            </span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Revenue"
            value={`$${summary.revenue.toLocaleString()}`}
            sub="Total attributable"
          />
          <StatCard
            label="Conversions"
            value={summary.conversions.toLocaleString()}
            sub="Orders"
          />
          <StatCard
            label="Clicks"
            value={summary.clicks.toLocaleString()}
            sub="All platforms"
          />
          <StatCard
            label="Impressions"
            value={summary.impressions.toLocaleString()}
            sub="Upper funnel"
          />
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">Full Funnel</h2>
            <p className="text-xs text-neutral-500">IG → LTK → Amazon</p>
          </div>
          <div className="space-y-3">
            {funnel.map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300">{step.label}</span>
                  <span className="font-mono text-neutral-400">
                    {step.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{
                      width: `${(step.value / maxFunnel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">Revenue trend</h2>
            <p className="text-xs text-neutral-500">Mock last 4 weeks</p>
          </div>
          <MetricSpark series={revenueSeries} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SmallCard
            title="Creators"
            value={summary.creatorsCount.toString()}
            description="Active creators synced into the system."
          />
          <SmallCard
            title="Campaigns"
            value={summary.campaignsCount.toString()}
            description="Live or recently active campaigns."
          />
          <SmallCard
            title="Tracked Posts"
            value={summary.postsCount.toString()}
            description="IG, LTK, and Amazon-linked posts."
          />
        </section>
      </div>
    </main>
  );
}

function StatCard(props: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 space-y-1">
      <p className="text-xs text-neutral-400">{props.label}</p>
      <p className="text-2xl font-semibold tracking-tight">{props.value}</p>
      {props.sub && <p className="text-[11px] text-neutral-500">{props.sub}</p>}
    </div>
  );
}

function SmallCard(props: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 space-y-1">
      <p className="text-xs text-neutral-400">{props.title}</p>
      <p className="text-xl font-semibold">{props.value}</p>
      <p className="text-[11px] text-neutral-500">{props.description}</p>
    </div>
  );
}
