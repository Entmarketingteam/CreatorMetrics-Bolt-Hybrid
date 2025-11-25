"use client";

import { useEffect, useState } from "react";

type Digest = {
  creatorId: string;
  creatorName: string;
  health: {
    score: number;
    label: string;
  };
  text: string;
};

type DigestResponse = {
  mode: "demo" | "real";
  hasReal: boolean;
  digests: Digest[];
};

export default function DailyDigest() {
  const [data, setData] = useState<DigestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/digest");
        if (!res.ok) throw new Error("Failed to load digest");
        const json = (await res.json()) as DigestResponse;
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-title">Daily digest</div>
        <div className="cm-section-subtitle">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-title">Daily digest</div>
        <div className="cm-section-subtitle">
          Generating summary from latest funnels…
        </div>
      </div>
    );
  }

  return (
    <div className="cm-panel" style={{ marginTop: 16 }}>
      <div className="cm-panel-header">
        <div>
          <div className="cm-panel-title">Daily digest</div>
          <div className="cm-panel-subtitle">
            {data.mode === "real"
              ? "Using live funnels from your latest uploads."
              : "Using demo funnels. Upload exports to reflect your own data."}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {data.digests.map((d) => (
          <div key={d.creatorId} className="cm-card">
            <div className="cm-card-label">
              {d.creatorName} · Health: {d.health.label} ({d.health.score}
              /100)
            </div>
            <pre className="cm-codeblock cm-codeblock-prewrap">
              {d.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
