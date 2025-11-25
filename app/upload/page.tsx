"use client";

import { useState } from "react";

type IngestResult = {
  igPosts: number;
  ltkProducts: number;
  ltkEarningsRows: number;
  amazonItems: number;
  creatorFunnels: any[];
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
    setResult(null);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files.length) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file, file.name);
      }

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ingest failed");
      }

      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="cm-section-title">Upload exports</h1>
      <p className="cm-section-subtitle">
        Drop Instagram Business Suite CSVs, LTK analytics/earnings CSVs, and
        Amazon Affiliate Fee reports (ZIP/XML). We'll normalize them into a
        single funnel.
      </p>

      <form onSubmit={onSubmit} className="cm-panel" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="file"
            multiple
            onChange={onFileChange}
            className="cm-textarea"
            style={{ padding: 8, height: "auto" }}
          />
          <div className="cm-section-subtitle" style={{ marginTop: 6 }}>
            Supported now:
            <br />
            • Instagram Business Suite CSV
            <br />
            • LTK analytics & earnings CSV
            <br />
            • Amazon "Fee-*" ZIPs (Earnings, Orders, Tracking, etc.)
          </div>
        </div>

        <button
          type="submit"
          className="cm-ghost-button cm-ghost-button-strong"
          disabled={loading || !files.length}
        >
          {loading ? "Ingesting…" : "Run ingest pipeline"}
        </button>
      </form>

      {error && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">Error</div>
          <pre className="cm-codeblock">{error}</pre>
        </div>
      )}

      {result && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">Ingest result (summary)</div>
          <pre className="cm-codeblock">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
