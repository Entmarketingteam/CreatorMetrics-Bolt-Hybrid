"use client";

import React from "react";

export default function FunnelChart({
  funnel,
}: {
  funnel: { stage: string; value: number }[];
}) {
  if (!funnel?.length) return null;

  const max = funnel[0].value || 1;

  return (
    <div className="cm-funnelchart">
      {funnel.map((step, i) => {
        const pct = Math.max(0, (step.value / max) * 100);
        const prev = i > 0 ? funnel[i - 1].value : null;

        let dropPct = null;
        let dropColor = "#4ade80";

        if (prev !== null && prev > 0) {
          dropPct = ((prev - step.value) / prev) * 100;

          if (dropPct > 50) dropColor = "#ef4444";
          else if (dropPct > 20) dropColor = "#f59e0b";
        }

        return (
          <div key={step.stage} className="cm-funnelchart-row">
            <div className="cm-funnelchart-labels">
              <span>{step.stage.toUpperCase()}</span>
              <span className="cm-funnelchart-value">
                {step.value.toLocaleString()}
              </span>
            </div>

            <div className="cm-funnelchart-bar">
              <div
                className="cm-funnelchart-fill"
                style={{ width: `${pct}%` }}
              />
            </div>

            {dropPct !== null && (
              <div className="cm-funnelchart-drop" style={{ color: dropColor }}>
                -{dropPct.toFixed(1)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
