"use client";

import { useEffect, useState } from "react";

type AlertSeverity = "info" | "warning" | "critical";
type AlertScope = "creator" | "workspace";

type Alert = {
  id: string;
  type: string;
  severity: AlertSeverity;
  scope: AlertScope;
  creatorId?: string;
  creatorName?: string;
  metric: string;
  message: string;
  currentValue?: number;
  comparisonValue?: number;
  changePct?: number | null;
  createdAt: string;
  read: boolean;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) return;
      const json = await res.json();
      setAlerts(json.alerts ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function recompute() {
    setRecomputing(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
      });
      if (!res.ok) return;
      const json = await res.json();
      setAlerts(json.alerts ?? []);
    } catch {
    } finally {
      setRecomputing(false);
    }
  }

  async function markRead(id: string) {
    try {
      const res = await fetch("/api/alerts/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, read: true } : a
        )
      );
    } catch {
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/alerts/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch {
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <h1 className="cm-section-title">Alerts & anomalies</h1>
      <p className="cm-section-subtitle">
        Automatic funnel anomaly detection based on workspace benchmarks.
      </p>

      <div
        className="cm-panel"
        style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <div className="cm-panel-title">Status</div>
          <div className="cm-panel-subtitle">
            {loading
              ? "Loading alerts…"
              : unreadCount === 0
              ? "No unread alerts."
              : `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}.`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="cm-ghost-button"
            onClick={fetchAlerts}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            type="button"
            className="cm-ghost-button"
            onClick={markAllRead}
            disabled={!alerts.length}
          >
            Mark all read
          </button>
          <button
            type="button"
            className="cm-ghost-button cm-ghost-button-strong"
            onClick={recompute}
            disabled={recomputing}
          >
            {recomputing ? "Recomputing…" : "Recompute from funnels"}
          </button>
        </div>
      </div>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Alerts</div>
            <div className="cm-panel-subtitle">
              Funnel drops, RPC anomalies, and traffic spikes by creator.
            </div>
          </div>
        </div>

        {loading ? (
          <p className="cm-section-subtitle" style={{ marginTop: 10 }}>
            Loading…
          </p>
        ) : alerts.length === 0 ? (
          <p className="cm-section-subtitle" style={{ marginTop: 10 }}>
            No alerts yet. Recompute using the button above after ingesting data.
          </p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Creator / Scope</th>
                  <th>Metric</th>
                  <th>Message</th>
                  <th>Severity</th>
                  <th>Read</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr
                    key={a.id}
                    style={{
                      opacity: a.read ? 0.6 : 1,
                    }}
                  >
                    <td>
                      {new Date(a.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      {a.scope === "workspace"
                        ? "Workspace"
                        : a.creatorName || a.creatorId || "Creator"}
                    </td>
                    <td>{a.metric}</td>
                    <td>{a.message}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          border:
                            a.severity === "critical"
                              ? "1px solid #f97373"
                              : a.severity === "warning"
                              ? "1px solid #facc15"
                              : "1px solid #4ade80",
                        }}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td>{a.read ? "Yes" : "No"}</td>
                    <td style={{ textAlign: "right" }}>
                      {!a.read && (
                        <button
                          type="button"
                          className="cm-ghost-button"
                          onClick={() => markRead(a.id)}
                        >
                          Mark read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
