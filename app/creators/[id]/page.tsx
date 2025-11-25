import { notFound } from "next/navigation";
import {
  getCreatorById,
  getCreatorFunnel,
  FunnelStage,
} from "@/lib/demoData";

function FunnelMini({ funnel }: { funnel: FunnelStage[] }) {
  const max = funnel[0]?.value ?? 0;
  return (
    <div className="cm-funnel-list cm-funnel-list-mini">
      {funnel.map((stage) => {
        const pct = max === 0 ? 0 : (stage.value / max) * 100;
        return (
          <div key={stage.stage} className="cm-funnel-row">
            <div className="cm-funnel-label">
              <span>{stage.stage.toUpperCase()}</span>
              <span className="cm-funnel-value">
                {stage.value.toLocaleString()}
              </span>
            </div>
            <div className="cm-funnel-track">
              <div
                className="cm-funnel-fill"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type Props = {
  params: { id: string };
};

export default function CreatorDetailPage({ params }: Props) {
  const creator = getCreatorById(params.id);
  const funnel = getCreatorFunnel(params.id);

  if (!creator || !funnel) return notFound();

  const totalRevenue = funnel.revenueByPlatform.reduce(
    (s, r) => s + r.revenue,
    0
  );

  return (
    <div>
      <div className="cm-breadcrumb">
        <span>Creators</span>
        <span>/</span>
        <span>{creator.name}</span>
      </div>

      <div className="cm-creator-detail-header">
        <div className="cm-avatar-circle cm-avatar-lg">
          {creator.avatarInitials}
        </div>
        <div>
          <h1 className="cm-section-title">{creator.name}</h1>
          <p className="cm-section-subtitle">
            {creator.handle} ·{" "}
            {creator.platforms.map((p) => p.toUpperCase()).join(" · ")}
          </p>
        </div>
        <div className="cm-creator-detail-metrics">
          <div>
            <div className="cm-creator-label">Period Revenue</div>
            <div className="cm-creator-big">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="cm-creator-label">Revenue vs last period</div>
            <div className="cm-card-pill cm-card-pill-up">
              ▲ {funnel.comparedToLastPeriod.revenueDeltaPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="cm-creator-detail-grid">
        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Funnel</div>
              <div className="cm-panel-subtitle">
                Top-of-funnel to orders for this creator.
              </div>
            </div>
          </div>
          <FunnelMini funnel={funnel.funnel} />
        </section>

        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Revenue by platform</div>
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
                  <th>New vs Returning</th>
                </tr>
              </thead>
              <tbody>
                {funnel.revenueByPlatform.map((row) => (
                  <tr key={row.platform}>
                    <td>{row.platform.toUpperCase()}</td>
                    <td>${row.revenue.toLocaleString()}</td>
                    <td>{row.orders.toLocaleString()}</td>
                    <td>{row.clicks.toLocaleString()}</td>
                    <td>
                      {row.newCustomers}/{row.returningCustomers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cm-panel cm-panel-full">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Top Posts</div>
              <div className="cm-panel-subtitle">
                Cross-platform demo winners.
              </div>
            </div>
          </div>
          <div className="cm-topposts">
            {funnel.topPosts.map((p) => (
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
        </section>
      </div>
    </div>
  );
}
