"use client";

import { useEffect, useState } from "react";

type CreatorForecast = {
  creatorId: string;
  creatorName: string;
  baselineDaily: number;
  trendPerDay: number;
  forecast7: number;
  forecast30: number;
  forecast90: number;
};

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<CreatorForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/forecast");
        if (!res.ok) return;
        const json = await res.json();
        setForecasts(json.forecasts ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="cm-section-title">Forecast</h1>
        <p className="cm-section-subtitle">
          Forecasting revenue based on recent creator performance…
        </p>
      </div>
    );
  }

  if (!forecasts.length) {
    return (
      <div>
        <h1 className="cm-section-title">Forecast</h1>
        <p className="cm-section-subtitle">
          No order events found. Upload IG / LTK / Amazon exports to enable forecasting.
        </p>
      </div>
    );
  }

  const total = (key: keyof CreatorForecast) =>
    forecasts.reduce((s, f) => s + (f[key] as number), 0);

  const workspace7 = total("forecast7");
  const workspace30 = total("forecast30");
  const workspace90 = total("forecast90");

  return (
    <div>
      <h1 className="cm-section-title">Forecast</h1>
      <p className="cm-section-subtitle">
        Simple 7 / 30 / 90-day revenue forecasts per creator based on recent trends.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Workspace forecast</div>
            <div className="cm-panel-subtitle">
              Summed across all active creators in this workspace.
            </div>
          </div>
        </div>

        <div className="cm-metrics-row" style={{ marginTop: 12 }}>
          <div className="cm-card">
            <div className="cm-card-label">Next 7 days</div>
            <div className="cm-card-value">
              ${workspace7.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">Next 30 days</div>
            <div className="cm-card-value">
              ${workspace30.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">Next 90 days</div>
            <div className="cm-card-value">
              ${workspace90.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Creator-level forecast</div>
            <div className="cm-panel-subtitle">
              Baseline daily revenue, trend per day, and horizon totals.
            </div>
          </div>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Baseline / day</th>
                <th>Trend / day</th>
                <th>7-day</th>
                <th>30-day</th>
                <th>90-day</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f) => {
                const trendLabel =
                  f.trendPerDay > 0
                    ? `+${f.trendPerDay.toFixed(2)}`
                    : f.trendPerDay < 0
                    ? f.trendPerDay.toFixed(2)
                    : "0.00";

                return (
                  <tr key={f.creatorId}>
                    <td>{f.creatorName}</td>
                    <td>${f.baselineDaily.toFixed(2)}</td>
                    <td>{trendLabel}</td>
                    <td>${f.forecast7.toFixed(0)}</td>
                    <td>${f.forecast30.toFixed(0)}</td>
                    <td>${f.forecast90.toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
