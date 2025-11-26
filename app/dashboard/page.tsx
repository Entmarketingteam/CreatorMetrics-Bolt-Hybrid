import { getOverallSummary, getPrimaryFunnel, getActiveFunnels } from "@/lib/funnelStore";
import { getCreatorById } from "@/lib/demoData";
import FunnelChart from "@/components/FunnelChart";
import DailyDigest from "./DailyDigest";
import AlertsBanner from "@/components/AlertsBanner";
import { forecastRevenue } from "@/lib/forecast";

function MetricCard(props: {
  label: string;
  value: string;
  delta?: number;
}) {
  const { label, value, delta } = props;
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="cm-card">
      <div className="cm-card-label">{label}</div>
      <div className="cm-card-value-row">
        <div className="cm-card-value">{value}</div>
        {delta !== undefined && (
          <div
            className={
              "cm-card-pill " +
              (positive ? "cm-card-pill-up" : "cm-card-pill-down")
            }
          >
            {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div className="cm-funnel-row">
      <div className="cm-funnel-label">
        <span>{label}</span>
        <span className="cm-funnel-value">{value.toLocaleString()}</span>
      </div>
      <div className="cm-funnel-track">
        <div
          className="cm-funnel-fill"
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const summary = getOverallSummary();
  const primaryFunnel = getPrimaryFunnel();
  const funnels = getActiveFunnels();

  const forecast = primaryFunnel ? forecastRevenue(primaryFunnel) : 0;

  return (
    <div className="cm-grid">
      <section className="cm-grid-main">
        <h1 className="cm-section-title">Overview</h1>
        <p className="cm-section-subtitle">
          High-level view of your IG → LTK → Amazon performance (demo data).
        </p>

        <AlertsBanner />

        {summary && (
          <div className="cm-metrics-row">
            <MetricCard
              label="Total Revenue (period)"
              value={`$${summary.totalRevenue.toLocaleString()}`}
              delta={summary.revenueDeltaPct}
            />
            <MetricCard
              label="Total Orders"
              value={summary.totalOrders.toLocaleString()}
              delta={summary.ordersDeltaPct}
            />
            <MetricCard
              label="Total Clicks"
              value={summary.totalClicks.toLocaleString()}
              delta={summary.clickDeltaPct}
            />
          </div>
        )}

        {forecast > 0 && (
          <div className="cm-panel" style={{ marginTop: 16 }}>
            <div className="cm-panel-header">
              <div>
                <div className="cm-panel-title">7-Day Revenue Forecast</div>
                <div className="cm-panel-subtitle">
                  Projection based on recent activity using exponential smoothing.
                </div>
              </div>
            </div>

            <div className="cm-metrics-row" style={{ marginTop: 10 }}>
              <div className="cm-card">
                <div className="cm-card-label">Predicted Next 7 Days</div>
                <div className="cm-card-value">
                  ${Math.round(forecast).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {primaryFunnel && (
          <div className="cm-panel">
            <div className="cm-panel-header">
              <div>
                <div className="cm-panel-title">
                  Funnel · {primaryFunnel.creatorName}
                </div>
                <div className="cm-panel-subtitle">
                  Instagram → LTK → Amazon path for this period.
                </div>
              </div>
            </div>
            <FunnelChart funnel={primaryFunnel.funnel} />
          </div>
        )}
      </section>

      <aside className="cm-grid-side">
        <div className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Top Platforms</div>
              <div className="cm-panel-subtitle">
                Revenue by platform for this creator.
              </div>
            </div>
          </div>
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {primaryFunnel?.revenueByPlatform.map((row) => (
                  <tr key={row.platform}>
                    <td>{row.platform.toUpperCase()}</td>
                    <td>${row.revenue.toLocaleString()}</td>
                    <td>{row.orders.toLocaleString()}</td>
                    <td>{row.clicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Top Posts</div>
              <div className="cm-panel-subtitle">
                Demo of cross-platform winners.
              </div>
            </div>
          </div>
          <div className="cm-topposts">
            {primaryFunnel?.topPosts.map((p) => (
              <div key={p.id} className="cm-toppost">
                <div className="cm-toppost-header">
                  <span className="cm-pill-platform">
                    {p.platform.toUpperCase()}
                  </span>
                  <span className="cm-toppost-title">{p.title}</span>
                </div>
                <div className="cm-toppost-metrics">
                  <span>{p.clicks.toLocaleString()} clicks</span>
                  <span>{p.orders.toLocaleString()} orders</span>
                  <span>${p.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {funnels.length > 1 && (
        <section className="cm-panel" style={{ marginTop: 24, gridColumn: "1 / -1" }}>
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Creators overview</div>
              <div className="cm-panel-subtitle">
                Multi-creator revenue, orders, and clicks for this period.
              </div>
            </div>
          </div>
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {funnels.map((f) => {
                  const creator = getCreatorById(f.creatorId);
                  const revenue = f.revenueByPlatform.reduce(
                    (s, r) => s + r.revenue,
                    0
                  );
                  const orders = f.revenueByPlatform.reduce(
                    (s, r) => s + r.orders,
                    0
                  );
                  const clicks = f.revenueByPlatform.reduce(
                    (s, r) => s + r.clicks,
                    0
                  );
                  return (
                    <tr key={f.creatorId}>
                      <td>{creator?.name ?? f.creatorName}</td>
                      <td>${revenue.toLocaleString()}</td>
                      <td>{orders.toLocaleString()}</td>
                      <td>{clicks.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <DailyDigest />
    </div>
  );
}
