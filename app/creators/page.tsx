import Link from "next/link";
import { demoCreators, demoCreatorFunnels } from "@/lib/demoData";

export default function CreatorsPage() {
  return (
    <div>
      <h1 className="cm-section-title">Creators</h1>
      <p className="cm-section-subtitle">
        Each creator with their funnel and platform mix (demo mode).
      </p>

      <div className="cm-creators-grid">
        {demoCreators.map((creator) => {
          const funnel = demoCreatorFunnels.find(
            (f) => f.creatorId === creator.id
          );
          const revenue =
            funnel?.revenueByPlatform.reduce(
              (s, r) => s + r.revenue,
              0
            ) ?? 0;

          return (
            <Link
              key={creator.id}
              href={`/creators/${creator.id}`}
              className="cm-creator-card"
            >
              <div className="cm-creator-header">
                <div className="cm-avatar-circle">
                  {creator.avatarInitials}
                </div>
                <div>
                  <div className="cm-creator-name">{creator.name}</div>
                  <div className="cm-creator-handle">
                    {creator.handle}
                  </div>
                </div>
              </div>
              <div className="cm-creator-row">
                <span className="cm-pill-platform">
                  {creator.platforms.map((p) => p.toUpperCase()).join(" · ")}
                </span>
              </div>
              <div className="cm-creator-row">
                <span className="cm-creator-label">Period Revenue</span>
                <span className="cm-creator-value">
                  ${revenue.toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
