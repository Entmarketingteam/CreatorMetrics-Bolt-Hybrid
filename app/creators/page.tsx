import { getCreators } from '../../lib/storage';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Creators</h1>
          <p className="text-sm text-neutral-400">
            Each creator rolls up their IG → LTK → Amazon funnel.
          </p>
        </header>

        <div className="space-y-3 text-sm">
          {creators.map((c) => (
            <a
              key={c.id}
              href={`/creators/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 hover:border-neutral-500 transition-colors"
            >
              <div>
                <p className="font-medium">{c.displayName}</p>
                <p className="text-xs text-neutral-500">@{c.handle}</p>
              </div>
              <p className="text-xs text-neutral-500">
                Platforms: {c.platforms.join(', ')}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
