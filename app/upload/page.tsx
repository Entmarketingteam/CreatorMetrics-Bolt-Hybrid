"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CreatorFunnelSummary = {
  creatorName: string;
  revenueByPlatform: {
    platform: string;
    revenue: number;
    orders: number;
    clicks: number;
  }[];
};

type IngestResult = {
  igPosts: number;
  ltkProducts: number;
  ltkEarningsRows: number;
  amazonItems: number;
  creatorFunnels: CreatorFunnelSummary[];
};

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const next = Array.from(e.target.files);
    setFiles(next);
    setResult(null);
    setError(null);
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer.files?.length) return;
    const next = Array.from(e.dataTransfer.files);
    setFiles(next);
    setResult(null);
    setError(null);
  };

  const runIngest = useCallback(
    async (e: React.FormEvent) => {
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

        const json: IngestResult = await res.json();
        setResult(json);

        try {
          await fetch("/api/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "real" }),
          });
        } catch (err) {
          console.warn("Failed to switch mode to real", err);
        }
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [files]
  );

  const primaryFunnel = result?.creatorFunnels?.[0];
  const primaryRevenue =
    primaryFunnel?.revenueByPlatform?.reduce(
      (sum, r) => sum + (r.revenue ?? 0),
      0
    ) ?? 0;
  const primaryOrders =
    primaryFunnel?.revenueByPlatform?.reduce(
      (sum, r) => sum + (r.orders ?? 0),
      0
    ) ?? 0;
  const primaryClicks =
    primaryFunnel?.revenueByPlatform?.reduce(
      (sum, r) => sum + (r.clicks ?? 0),
      0
    ) ?? 0;

  return (
    <div>
      <h1 className="cm-section-title">Upload exports</h1>
      <p className="cm-section-subtitle">
        Drag your Instagram Business Suite CSVs, LTK analytics/earnings CSVs,
        and Amazon Affiliate Fee ZIPs here. We'll normalize them into a single
        IG → LTK → Amazon funnel.
      </p>

      <form
        onSubmit={runIngest}
        className="cm-panel"
        style={{ marginTop: 16 }}
      >
        <div
          className={
            "cm-dropzone" + (isDragging ? " cm-dropzone-active" : "")
          }
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onFileChange}
            style={{ display: "none" }}
          />

          <div className="cm-dropzone-inner">
            <div className="cm-dropzone-title">
              {files.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : "Drag & drop exports here"}
            </div>
            <div className="cm-dropzone-subtitle">
              Or{" "}
              <button
                type="button"
                className="cm-ghost-button cm-ghost-button-strong"
                onClick={onBrowseClick}
              >
                browse files
              </button>
            </div>
            <div className="cm-dropzone-hint">
              Supported:
              <br />
              • Instagram Business Suite CSV
              <br />
              • LTK analytics &amp; earnings CSV
              <br />
              • Amazon "Fee-*" ZIPs (Earnings, Orders, Tracking, etc.)
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="cm-selected-files">
            {files.slice(0, 4).map((file) => (
              <div key={file.name} className="cm-selected-file-row">
                <span className="cm-selected-file-name">{file.name}</span>
                <span className="cm-selected-file-size">
                  {(file.size / 1024).toFixed(1)} kB
                </span>
              </div>
            ))}
            {files.length > 4 && (
              <div className="cm-selected-file-more">
                + {files.length - 4} more…
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            type="submit"
            className="cm-ghost-button cm-ghost-button-strong"
            disabled={loading || !files.length}
          >
            {loading ? "Ingesting…" : "Run ingest & update funnel"}
          </button>

          {result && (
            <button
              type="button"
              className="cm-ghost-button"
              onClick={() => router.push("/dashboard")}
            >
              View Live Dashboard
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">Error</div>
          <pre className="cm-codeblock">{error}</pre>
        </div>
      )}

      {result && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Ingest result</div>
              <div className="cm-panel-subtitle">
                Your data is now live. The dashboard is using these funnels.
              </div>
            </div>
          </div>

          <div className="cm-metrics-row">
            <div className="cm-card">
              <div className="cm-card-label">IG Posts Parsed</div>
              <div className="cm-card-value">
                {result.igPosts.toLocaleString()}
              </div>
            </div>
            <div className="cm-card">
              <div className="cm-card-label">LTK Products</div>
              <div className="cm-card-value">
                {result.ltkProducts.toLocaleString()}
              </div>
            </div>
            <div className="cm-card">
              <div className="cm-card-label">LTK Earnings Rows</div>
              <div className="cm-card-value">
                {result.ltkEarningsRows.toLocaleString()}
              </div>
            </div>
            <div className="cm-card">
              <div className="cm-card-label">Amazon Items</div>
              <div className="cm-card-value">
                {result.amazonItems.toLocaleString()}
              </div>
            </div>
          </div>

          {primaryFunnel && (
            <div style={{ marginTop: 16 }}>
              <div className="cm-panel-title" style={{ marginBottom: 4 }}>
                Primary funnel · {primaryFunnel.creatorName}
              </div>
              <div className="cm-section-subtitle">
                Revenue: ${primaryRevenue.toLocaleString()} · Orders:{" "}
                {primaryOrders.toLocaleString()} · Clicks:{" "}
                {primaryClicks.toLocaleString()}
              </div>
            </div>
          )}

          <pre className="cm-codeblock" style={{ marginTop: 16 }}>
            {JSON.stringify(result.creatorFunnels, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
