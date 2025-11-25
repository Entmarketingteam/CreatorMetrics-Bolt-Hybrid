export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50">
      <div className="space-y-2 text-center">
        <div className="h-6 w-6 rounded-full border-2 border-neutral-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading CreatorMetrics…</p>
      </div>
    </main>
  );
}
