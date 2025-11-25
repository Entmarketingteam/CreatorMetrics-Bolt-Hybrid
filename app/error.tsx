'use client';

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center">
        <div className="max-w-sm mx-auto space-y-3 text-center">
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="text-xs text-neutral-500">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
