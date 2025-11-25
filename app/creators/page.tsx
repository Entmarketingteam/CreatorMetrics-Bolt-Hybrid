import Link from "next/link";
import { getActiveFunnels } from "@/lib/funnelStore";
import { getCreatorById } from "@/lib/demoData";

export default function CreatorsPage() {
  const funnels = getActiveFunnels();

  return (
    <div>
      <h1 className="cm-section-title">Creators</h1>
      <p className="cm-section-subtitle">
        See performance at the creator level. Click into a creator to view their
        IG → LTK → Amazon funnel and platform mix.
      </p>

      <div className="cm-creators-grid">
        {funnels.map((f) => {
          const creatorMeta = getCreatorById(f.creatorId);
          const name = creatorMeta?.name ?? f.creatorName;
          const handle = (creatorMeta as any)?.handle ?? "";
          const avatarInitials =
            creatorMeta?.name
              ?.split(" ")
              .map((x) => x[0])
              .join("")
              .toUpperCase() ?? "CR";

          const totalRevenue = f.revenueByPlatform.reduce(
            (sum, r) => sum + (r.revenue ?? 0),
            0
          );
          const totalOrders = f.revenueByPlatform.reduce(
            (sum, r) => sum + (r.orders ?? 0),
            0
          );
          const totalClicks = f.revenueByPlatform.reduce(
            (sum, r) => sum + (r.clicks ?? 0),
            0
          );

          const bestPlatform =
            f.revenueByPlatform.length > 0
              ? [...f.revenueByPlatform].sort(
                  (a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)
                )[0]
              : null;

          return (
            <Link
              key={f.creatorId}
              href={`/creators/${f.creatorId}`}
              className="cm-creator-card"
            >
              <div className="cm-creator-card-header">
                <div className="cm-creator-avatar">
                  <span>{avatarInitials}</span>
                </div>
                <div className="cm-creator-header-text">
                  <div className="cm-creator-name">{name}</div>
                  {handle && (
                    <div className="cm-creator-handle">{handle}</div>
                  )}
                </div>
              </div>

              <div className="cm-creator-metrics-row">
                <div className="cm-creator-metric">
                  <div className="cm-creator-metric-label">Revenue</div>
                  <div className="cm-creator-metric-value">
                    ${totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="cm-creator-metric">
                  <div className="cm-creator-metric-label">Orders</div>
                  <div className="cm-creator-metric-value">
                    {totalOrders.toLocaleString()}
                  </div>
                </div>
                <div className="cm-creator-metric">
                  <div className="cm-creator-metric-label">Clicks</div>
                  <div className="cm-creator-metric-value">
                    {totalClicks.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="cm-creator-foot">
                {bestPlatform ? (
                  <span className="cm-creator-chip">
                    Top platform: {bestPlatform.platform.toUpperCase()}
                  </span>
                ) : (
                  <span className="cm-creator-chip cm-creator-chip-muted">
                    No platform data yet
                  </span>
                )}
                <span className="cm-creator-link">View details →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
