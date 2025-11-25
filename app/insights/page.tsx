"use client";

import { useState } from "react";

type CreatorStats = {
  creatorId: string;
  creatorName: string;
  totalRevenue: number;
  totalOrders: number;
  totalClicks: number;
  bestPlatform?: {
    platform: string;
    revenue: number;
    orders: number;
    clicks: number;
    revenueShare: number;
  };
  biggestDropStage?: {
    stage: string;
    fromValue: number;
    toValue: number;
    dropPct: number;
  };
};

type InsightsStats = {
  mode: "demo" | "real";
  hasReal: boolean;
  scope: "primary" | "all";
  selectedCreatorId: string | null;
  creators: CreatorStats[];
};

type InsightsResponse = {
  text: string;
  stats: InsightsStats;
};

export default function InsightsPage() {
  const [question, setQuestion] = useState(
    "Give me a performance summary for the current primary creator's IG → LTK → Amazon funnel. Call out the biggest drop-off, the strongest platform, and what tests we should run next."
  );
  const [scope, setScope] = useState<"primary" | "all">("primary");
  const [answer, setAnswer] = useState<string>("");
  const [stats, setStats] = useState<InsightsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runInsights(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");
    setError(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          scope,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Insights agent failed");
      }

      const data = (await res.json()) as InsightsResponse;
      setAnswer(data.text ?? "");
      setStats(data.stats ?? null);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const modeLabel =
    stats?.mode === "real"
      ? "Live data"
      : "Demo data";

  const modeSub =
    stats?.mode === "real"
      ? "Using funnels built from your latest upload."
      : "Using built-in demo funnels. Upload exports on the Upload tab for your own data.";

  return (
    <div>
      <h1 className="cm-section-title">AI Insights</h1>
      <p className="cm-section-subtitle">
        Ask CreatorMetrics to interpret your IG → LTK → Amazon funnels like a
        performance marketing lead.
      </p>

      <div
        className="cm-panel"
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Context</div>
            <div className="cm-panel-subtitle">
              {modeLabel} ·{" "}
              {scope === "primary"
                ? "Primary creator only"
                : "All creators overview"}
            </div>
          </div>
        </div>

        <div className="cm-insights-context">
          <div className="cm-insights-badge-row">
            <span
              className={
                "cm-pill-badge" +
                (stats?.mode === "real"
                  ? " cm-pill-badge-live"
                  : "")
              }
            >
              {modeLabel}
            </span>
            <span className="cm-pill-badge cm-pill-badge-soft">
              Scope:{" "}
              {scope === "primary"
                ? "Primary creator"
                : "All creators"}
            </span>
          </div>
          <p className="cm-insights-context-text">{modeSub}</p>

          <div className="cm-insights-scope-toggle">
            <label>
              <input
                type="radio"
                name="scope"
                value="primary"
                checked={scope === "primary"}
                onChange={() => setScope("primary")}
              />{" "}
              Primary creator
            </label>
            <label>
              <input
                type="radio"
                name="scope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
              />{" "}
              All creators
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={runInsights} className="cm-insights-form">
        <label className="cm-insights-label">
          Question
          <textarea
            className="cm-textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
          />
        </label>

        <button
          type="submit"
          className="cm-ghost-button cm-ghost-button-strong"
          disabled={loading}
        >
          {loading ? "Analyzing funnel…" : "Ask the Insights Agent"}
        </button>
      </form>

      {error && (
        <div className="cm-panel cm-insights-output">
          <div className="cm-panel-title">Error</div>
          <pre className="cm-codeblock">{error}</pre>
        </div>
      )}

      {answer && (
        <div className="cm-panel cm-insights-output">
          <div className="cm-panel-title">Agent response</div>
          <pre className="cm-codeblock cm-codeblock-prewrap">
            {answer}
          </pre>
        </div>
      )}

      {stats && stats.creators?.length > 0 && (
        <div className="cm-panel cm-insights-output">
          <div className="cm-panel-title">
            Underlying funnel stats
          </div>
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Clicks</th>
                  <th>Top platform</th>
                </tr>
              </thead>
              <tbody>
                {stats.creators.map((c) => (
                  <tr key={c.creatorId}>
                    <td>{c.creatorName}</td>
                    <td>
                      $
                      {c.totalRevenue.toLocaleString()}
                    </td>
                    <td>
                      {c.totalOrders.toLocaleString()}
                    </td>
                    <td>
                      {c.totalClicks.toLocaleString()}
                    </td>
                    <td>
                      {c.bestPlatform
                        ? `${c.bestPlatform.platform.toUpperCase()} (${(
                            c.bestPlatform.revenueShare *
                            100
                          ).toFixed(1)}%)`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
