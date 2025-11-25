"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Workspace = {
  id: string;
  name: string;
  managesMultipleCreators: boolean;
  connectedPlatforms: {
    instagram: boolean;
    ltk: boolean;
    amazon: boolean;
    tiktokShop: boolean;
  };
};

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("CreatorMetrics Workspace");
  const [multiCreators, setMultiCreators] = useState(true);
  const [platforms, setPlatforms] = useState({
    instagram: true,
    ltk: true,
    amazon: true,
    tiktokShop: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workspace");
        if (!res.ok) return;
        const ws = (await res.json()) as Workspace;
        setWorkspace(ws);
        setName(ws.name);
        setMultiCreators(ws.managesMultipleCreators);
        setPlatforms(ws.connectedPlatforms);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function persistAndNext(nextStep?: 1 | 2 | 3) {
    setLoading(true);
    try {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          managesMultipleCreators: multiCreators,
          connectedPlatforms: platforms,
        }),
      });
      if (nextStep) {
        setStep(nextStep);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to save workspace", err);
    } finally {
      setLoading(false);
    }
  }

  function togglePlatform(key: keyof typeof platforms) {
    setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const stepLabel =
    step === 1 ? "About your brand" : step === 2 ? "Connect platforms" : "Load data";

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="cm-login-wrap">
      <div className="cm-login-card" style={{ maxWidth: 480, textAlign: "left" }}>
        <div className="cm-logo-circle">CM</div>
        <h1 className="cm-section-title" style={{ marginTop: 12 }}>
          Workspace setup
        </h1>
        <p className="cm-section-subtitle">
          A quick 3-step wizard to personalize CreatorMetrics for your creator business.
        </p>

        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>{stepLabel}</span>
            <span>{progressPct}%</span>
          </div>
          <div
            style={{
              width: "100%",
              height: 4,
              borderRadius: 999,
              background: "#020617",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                transition: "width 0.25s ease-out",
                background:
                  "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
              }}
            />
          </div>
        </div>

        {step === 1 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <label className="cm-login-label">
              Workspace name
              <input
                className="cm-login-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ent Agency Creator Workspace"
              />
            </label>

            <label className="cm-login-label" style={{ flexDirection: "row", gap: 8 }}>
              <input
                type="checkbox"
                checked={multiCreators}
                onChange={(e) => setMultiCreators(e.target.checked)}
                style={{ width: 14, height: 14 }}
              />
              <span>You manage multiple creators in this workspace</span>
            </label>

            <button
              className="cm-ghost-button cm-ghost-button-strong"
              style={{ marginTop: 8 }}
              disabled={loading}
              onClick={() => persistAndNext(2)}
            >
              {loading ? "Saving…" : "Continue to platform setup"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="cm-section-subtitle" style={{ marginBottom: 4 }}>
              For hackathon, these are fake connections – just tell us where you operate.
            </p>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["instagram", "Instagram Business / Reels"],
                ["ltk", "LTK Analytics / Earnings"],
                ["amazon", "Amazon Influencer / Associates"],
                ["tiktokShop", "TikTok Shop (coming soon)"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="cm-login-label"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 999,
                    border: "1px solid #1f2937",
                    padding: "6px 10px",
                    background: "#020617",
                  }}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={platforms[key as keyof typeof platforms]}
                    onChange={() => togglePlatform(key as keyof typeof platforms)}
                    style={{ width: 14, height: 14 }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button
                type="button"
                className="cm-ghost-button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="cm-ghost-button cm-ghost-button-strong"
                disabled={loading}
                onClick={() => persistAndNext(3)}
              >
                {loading ? "Saving…" : "Continue to data"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="cm-section-subtitle">
              You can start with built-in demo creators (Nicki, Emily, Ann) or upload exports to
              build funnels from your own data.
            </p>

            <button
              type="button"
              className="cm-ghost-button cm-ghost-button-strong"
              disabled={loading}
              onClick={() => persistAndNext(undefined)}
            >
              {loading ? "Finishing…" : "Use demo creators & go to dashboard"}
            </button>

            <button
              type="button"
              className="cm-ghost-button"
              onClick={() => router.push("/upload")}
            >
              Skip & upload real IG / LTK / Amazon exports
            </button>

            <button
              type="button"
              className="cm-ghost-button"
              onClick={() => setStep(2)}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
