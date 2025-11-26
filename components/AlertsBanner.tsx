"use client";

import { useEffect, useState } from "react";

type AlertSeverity = "info" | "warning" | "critical";

type Alert = {
  id: string;
  severity: AlertSeverity;
  message: string;
  read: boolean;
};

export default function AlertsBanner() {
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/alerts");
        if (!res.ok) return;
        const json = await res.json();
        const alerts = (json.alerts ?? []) as Alert[];
        const critical =
          alerts.find(
            (a) => !a.read && a.severity === "critical"
          ) ?? alerts.find((a) => !a.read);
        if (critical) setAlert(critical);
      } catch {
      }
    })();
  }, []);

  if (!alert) return null;

  return (
    <div
      className="cm-panel"
      style={{
        marginTop: 12,
        borderColor:
          alert.severity === "critical"
            ? "#f97373"
            : "#facc15",
      }}
    >
      <div className="cm-panel-title">
        Funnel alert: {alert.message}
      </div>
      <div className="cm-panel-subtitle">
        View full details on the{" "}
        <a href="/alerts" className="cm-link">
          Alerts
        </a>{" "}
        page.
      </div>
    </div>
  );
}
