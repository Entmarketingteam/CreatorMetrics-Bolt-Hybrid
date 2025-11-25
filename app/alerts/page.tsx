"use client";

import { useEffect, useState } from "react";
import type {
  AlertsSummary,
  AlertSeverity,
  CreatorAlertSummary,
} from "@/lib/alerts";

export default function AlertsPage() {
  const [data, setData] = useState<AlertsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorFilter, setCreatorFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">(
    "all"
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/alerts");
        if (!res.ok) throw new Error("Failed to load alerts");
        const json = (await res.json()) as AlertsSummary;
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function filteredCreators(): CreatorAlertSummary[] {
    if (!data) return [];
    return data.creators
      .map((c) => {
        let alerts = c.alerts;
        if (severityFilter !== "all") {
          alerts = alerts.filter((a) => a.severity === severityFilter);
        }
        return { ...c, alerts };
      })
      .filter((c) => {
        if (creatorFilter !== "all" && c.creatorId !== creatorFilter) {
          return false;
        }
        return c.alerts.length > 0;
      });
  }

  const creatorsWithAlerts = filteredCreators();

  const modeLabel =
    data?.mode === "real"
      ? "Live data"
      : "Demo data";

  return (
    <div>
      <h1 className="cm-section-title">Alerts & Opportunities</h1>
      <p className="cm-section-subtitle">
        CreatorMetrics scans each creator's IG → LTK → Amazon funnel for drop
        offs, tracking issues, and opportunity areas.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Filters</div>
            <div className="cm-panel-subtitle">
              {modeLabel} · Automatically generated from your normalized
              funnels.
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <select
            className="cm-select"
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
          >
            <option value="all">All creators</option>
            {data?.creators.map((c) => (
              <option key={c.creatorId} value={c.creatorId}>
                {c.creatorName}
              </option>
            ))}
          </select>

          <select
            className="cm-select"
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value as AlertSeverity | "all")
            }
          >
            <option value="all">All severities</option>
            <option value="high">High only</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">Scanning funnels…</div>
          <div className="cm-section-subtitle">
            Looking for drop-offs, tracking issues, and quick wins.
          </div>
        </div>
      )}

      {error && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">Error</div>
          <pre className="cm-codeblock">{error}</pre>
        </div>
      )}

      {!loading && !error && creatorsWithAlerts.length === 0 && (
        <div className="cm-panel" style={{ marginTop: 16 }}>
          <div className="cm-panel-title">No alerts right now 🎉</div>
          <p className="cm-section-subtitle">
            Funnels look stable. Keep driving qualified traffic and check back
            after your next upload.
          </p>
        </div>
      )}

      {creatorsWithAlerts.map((c) => (
        <div
          key={c.creatorId}
          className="cm-panel"
          style={{ marginTop: 16 }}
        >
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">
                {c.creatorName}
                <span
                  className={
                    "cm-pill-badge" +
                    (c.health.label === "At risk"
                      ? " cm-pill-badge-live"
                      : " cm-pill-badge-soft")
                  }
                  style={{ marginLeft: 8 }}
                >
                  Health: {c.health.label} ({c.health.score}/100)
                </span>
              </div>
              <div className="cm-panel-subtitle">
                Revenue: ${c.totalRevenue.toLocaleString()} · Orders:{" "}
                {c.totalOrders.toLocaleString()} · Clicks:{" "}
                {c.totalClicks.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="cm-alerts-grid">
            {c.alerts.map((a) => (
              <div
                key={a.id}
                className={`cm-alert-card cm-alert-${a.severity}`}
              >
                <div className="cm-alert-header">
                  <span className="cm-alert-severity">
                    {a.severity === "high"
                      ? "High"
                      : a.severity === "medium"
                      ? "Medium"
                      : "Low"}
                  </span>
                  {a.stage && (
                    <span className="cm-alert-stage">
                      {safeStage(a.stage)}
                    </span>
                  )}
                </div>
                <div className="cm-alert-title">{a.title}</div>
                <div className="cm-alert-message">{a.message}</div>
              </div>
            ))}

            {c.opportunities.length > 0 && (
              <div className="cm-opportunity-column">
                <div className="cm-panel-title" style={{ marginBottom: 4 }}>
                  Opportunities
                </div>
                <ul className="cm-opportunity-list">
                  {c.opportunities.map((o) => (
                    <li key={o.id} className={`cm-opportunity-${o.impact}`}>
                      <div className="cm-opportunity-title">{o.title}</div>
                      <div className="cm-opportunity-desc">
                        {o.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function safeStage(stage: string) {
  switch (stage.toLowerCase()) {
    case "impressions":
      return "Impressions";
    case "clicks":
      return "Clicks";
    case "dpv":
      return "Detail page views";
    case "atc":
      return "Add to cart";
    case "orders":
      return "Orders";
    default:
      return stage;
  }
}
