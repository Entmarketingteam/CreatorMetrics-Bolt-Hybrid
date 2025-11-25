'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [instagram, setInstagram] = useState<File | null>(null);
  const [ltk, setLTK] = useState<File | null>(null);
  const [amazon, setAmazon] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  async function handleUpload() {
    const form = new FormData();
    if (instagram) form.append('instagram', instagram);
    if (ltk) form.append('ltk', ltk);
    if (amazon) form.append('amazon', amazon);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 px-0 py-0">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Upload Data</h1>
        <p className="text-sm text-neutral-400">
          Upload CSV or XML exports from Instagram, LTK, or Amazon to run them through the ingestion pipeline.
        </p>

        <div className="space-y-4">
          <FileInput label="Instagram CSV" onChange={setInstagram} />
          <FileInput label="LTK CSV" onChange={setLTK} />
          <FileInput label="Amazon XML" onChange={setAmazon} />
        </div>

        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Ingest Data
        </button>

        {result && (
          <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-xs whitespace-pre-wrap max-h-96 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}

function FileInput({
  label,
  onChange,
}: {
  label: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-neutral-300">{label}</span>
      <input
        type="file"
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 w-full text-xs"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
